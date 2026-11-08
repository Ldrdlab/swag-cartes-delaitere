/**
 * Nuanceur de flammes de l'effet « Feu » (GLSL ES 3.0), écrit pour ce projet.
 *
 * Principe : bruit fractal (FBM, 5 octaves, déformé par lui-même) qui monte avec le temps ; les
 * flammes naissent en bas et lèchent les côtés, le centre de la carte (illustration) est épargné ;
 * couleur selon la « profondeur » de la flamme (rouge sombre → orange → jaune pâle), idée reprise du
 * principe de neungkl/fire-simulation (MIT), sans code ; braises en cellules qui montent.
 * En qualité « éco », 3 octaves seulement.
 * Expose : FEU_FRAGMENTS.
 */
export const FEU_FRAGMENTS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_intensity;
uniform float u_speed;
uniform float u_octaves;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    if (float(i) >= u_octaves) break;
    value += amplitude * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.y / max(u_resolution.x, 1.0);
  float t = u_time * u_speed;
  // Distance au foyer : bas de la carte, puis côtés (les flammes y montent moins haut).
  float side = min(uv.x, 1.0 - uv.x) * 1.7;
  float edge = min(side, uv.y);
  vec2 q = vec2(uv.x * 3.2, uv.y * aspect * 2.6 - t * 1.3);
  float n = fbm(q + vec2(fbm(q * 1.4 + t * 0.25), 0.0));
  float flame = smoothstep(0.0, 1.0, n * 1.45 - edge * 3.4);
  // Braises : quelques cellules allumées qui montent, plus nombreuses en bas.
  vec2 grid = vec2(uv.x * 26.0, uv.y * aspect * 26.0 - t * 3.2);
  float seed = hash(floor(grid));
  float ember = step(0.94, seed) * smoothstep(0.2, 0.0, length(fract(grid) - 0.5)) * (1.0 - uv.y);
  vec3 color = mix(vec3(0.55, 0.04, 0.0), vec3(1.0, 0.42, 0.04), smoothstep(0.15, 0.55, flame));
  color = mix(color, vec3(1.0, 0.88, 0.5), smoothstep(0.6, 1.0, flame));
  color += ember * vec3(1.0, 0.55, 0.15);
  float alpha = clamp(flame + ember, 0.0, 1.0) * u_intensity;
  outColor = vec4(color, alpha);
}`;
