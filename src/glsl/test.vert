varying vec2 vUv;
uniform float curlR;
void main()
{
  vUv = uv;

  float theta = position.x / curlR;
  float tx = curlR * sin(theta);
  float ty = position.y;
  float tz = curlR * (1.0 - cos(theta));
  vec3 p = vec3(tx, ty, tz);

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}