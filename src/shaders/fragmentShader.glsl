uniform vec3 uColor;

varying vec2 vUv;

void main() {
    // gl_FragColor = vec4(0.7922, 0.898, 0.9686, 1.0);
    gl_FragColor = vec4(uColor, 1.0);
}