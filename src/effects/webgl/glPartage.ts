/**
 * Moteur WebGL partagé par les effets de carte qui en ont besoin (le feu).
 *
 * Rôle : les navigateurs limitent le nombre de contextes WebGL actifs (16 dans Chromium : au-delà, le
 * plus ancien est perdu). Un SEUL contexte WebGL2 sert donc toute la page : chaque carte y dessine son
 * image puis la recopie dans son propre canevas 2D (non limité). Une carte inactive garde sa dernière
 * image sans occuper le contexte.
 * Expose : UniformeValeur, dessinerNuanceur().
 * Dépend de : rien (API du navigateur).
 *
 * Sans WebGL2 (ou contexte perdu), `dessinerNuanceur` renvoie `false` : l'effet garde ses calques CSS de
 * repli. Le contexte est recréé à la demande suivante.
 */

/** Valeur d'un uniforme : nombre (float) ou vecteur de 2 à 4 nombres. */
export type UniformeValeur = number | readonly number[];

interface Programme {
  programme: WebGLProgram;
  uniformes: Map<string, WebGLUniformLocation | null>;
}

interface EtatPartage {
  canevas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  programmes: Map<string, Programme>;
}

/** Deux triangles qui couvrent tout l'écran, en coordonnées de découpe. */
const RECTANGLE = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

/** Nuanceur de sommets commun : un rectangle plein, `v_uv` de 0 à 1 (origine en bas à gauche). */
const SOMMETS = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

/** `undefined` = jamais essayé ; `null` = WebGL2 indisponible. */
let partage: EtatPartage | null | undefined;

function contextePartage(): EtatPartage | null {
  if (partage !== undefined) return partage;
  if (typeof document === 'undefined') return (partage = null);
  const canevas = document.createElement('canvas');
  const gl = canevas.getContext('webgl2', {
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
  });
  if (!gl) return (partage = null);
  // Contexte perdu (pilote, mise en veille) : on repartira de zéro à la prochaine demande.
  canevas.addEventListener('webglcontextlost', () => {
    partage = undefined;
  });
  const tampon = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tampon);
  gl.bufferData(gl.ARRAY_BUFFER, RECTANGLE, gl.STATIC_DRAW);
  partage = { canevas, gl, programmes: new Map() };
  return partage;
}

function compiler(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const nuanceur = gl.createShader(type);
  if (!nuanceur) throw new Error('Nuanceur WebGL impossible à créer');
  gl.shaderSource(nuanceur, source);
  gl.compileShader(nuanceur);
  if (!gl.getShaderParameter(nuanceur, gl.COMPILE_STATUS)) {
    throw new Error(`Nuanceur WebGL invalide : ${gl.getShaderInfoLog(nuanceur) ?? ''}`);
  }
  return nuanceur;
}

/** Programme d'un nuanceur de fragments (compilé une fois, puis réutilisé). */
function programmePour(etat: EtatPartage, fragments: string): Programme {
  const memo = etat.programmes.get(fragments);
  if (memo) return memo;
  const { gl } = etat;
  const programme = gl.createProgram();
  gl.attachShader(programme, compiler(gl, gl.VERTEX_SHADER, SOMMETS));
  gl.attachShader(programme, compiler(gl, gl.FRAGMENT_SHADER, fragments));
  gl.linkProgram(programme);
  if (!gl.getProgramParameter(programme, gl.LINK_STATUS)) {
    throw new Error(`Programme WebGL invalide : ${gl.getProgramInfoLog(programme) ?? ''}`);
  }
  const compile = { programme, uniformes: new Map<string, WebGLUniformLocation | null>() };
  etat.programmes.set(fragments, compile);
  return compile;
}

function poserUniforme(gl: WebGL2RenderingContext, lieu: WebGLUniformLocation, v: UniformeValeur) {
  if (typeof v === 'number') gl.uniform1f(lieu, v);
  else if (v.length === 2) gl.uniform2f(lieu, v[0] ?? 0, v[1] ?? 0);
  else if (v.length === 3) gl.uniform3f(lieu, v[0] ?? 0, v[1] ?? 0, v[2] ?? 0);
  else gl.uniform4f(lieu, v[0] ?? 0, v[1] ?? 0, v[2] ?? 0, v[3] ?? 0);
}

/**
 * Dessine un nuanceur de fragments dans le contexte partagé, puis recopie l'image dans `cible`.
 * @returns Faux si WebGL2 est indisponible (rien n'est dessiné).
 */
export function dessinerNuanceur(
  fragments: string,
  uniformes: Readonly<Record<string, UniformeValeur>>,
  cible: CanvasRenderingContext2D,
): boolean {
  const etat = contextePartage();
  if (!etat) return false;
  const { gl, canevas } = etat;
  const { width, height } = cible.canvas;
  if (canevas.width !== width || canevas.height !== height) {
    canevas.width = width;
    canevas.height = height;
  }
  const compile = programmePour(etat, fragments);
  gl.viewport(0, 0, width, height);
  gl.useProgram(compile.programme);
  const position = gl.getAttribLocation(compile.programme, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  for (const [nom, valeur] of Object.entries({ u_resolution: [width, height], ...uniformes })) {
    if (!compile.uniformes.has(nom)) {
      compile.uniformes.set(nom, gl.getUniformLocation(compile.programme, nom));
    }
    const lieu = compile.uniformes.get(nom);
    if (lieu) poserUniforme(gl, lieu, valeur);
  }
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, RECTANGLE.length / 2);
  cible.clearRect(0, 0, width, height);
  cible.drawImage(canevas, 0, 0);
  return true;
}
