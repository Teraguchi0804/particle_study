uniform sampler2D texture;                                    // uniform 変数としてテクスチャのデータを受け取る
varying vec2 vUv;                                             // vertexShaderで処理されて渡されるテクスチャ座標

void main()
{
  gl_FragColor = texture2D(texture, vUv);                     // テクスチャの色情報をそのままピクセルに塗る
}
