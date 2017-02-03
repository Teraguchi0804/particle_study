// 移動方向についていろいろ計算できるシェーダー。
// 今回はなにもしてない。
// ここでVelのx y zについて情報を上書きすると、それに応じて移動方向が変わる
#include <common>

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float idParticle = uv.y * resolution.x + uv.x;
    vec4 tmpVel = texture2D( textureVelocity, uv );
    vec3 vel = tmpVel.xyz;

//ノイズ実装しようとしている。。。
//    float rand = random(10);
//    float noise = noise(rand);
//    vel = vel * noise;

    gl_FragColor = vec4( vel.xyz, 1.0 );
}