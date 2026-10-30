import { createDiagram } from './diagram.js';

export function createVisualization() {
  const diagramElement = document.querySelector('#diagram');
  const canvas = document.querySelector('#nephron');
  const status = document.querySelector('#fallback');
  const diagram = createDiagram(diagramElement);
  let scene, loading = false, requested = 'front';
  let state = { stage: 0, substance: 'all', playing: true, speed: .5, adh: 45, gfr: 125 };
  function showDiagram(message = '') {
    canvas.hidden = true;
    diagramElement.hidden = false;
    document.querySelectorAll('.anatomy-label').forEach(el => el.hidden = true);
    document.querySelector('.scene-guidance').textContent = '색이 있는 입자를 따라 물질의 이동을 관찰하세요';
    document.querySelectorAll('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === 'front'));
    document.querySelector('#rotate').disabled = true;
    document.querySelector('#reset-view').disabled = true;
    document.querySelector('#rotate').setAttribute('aria-pressed', 'false');
    status.textContent = message;
    status.hidden = !message;
    scene?.setState({ ...state, playing: false });
    diagram.setState(state);
  }
  function handleFailure() {
    requested = 'front';
    scene?.dispose();
    scene = undefined;
    showDiagram('3D를 지원하지 않는 환경입니다. 네프론 그림으로 이동 과정을 계속 관찰할 수 있어요.');
  }
  showDiagram();
  return {
    setState(value) {
      state = value;
      diagram.setState({ ...state, playing: !diagramElement.hidden && state.playing });
      scene?.setState({ ...state, playing: !canvas.hidden && state.playing });
    },
    async view(type) {
      requested = type;
      if (type === 'front') { showDiagram(); return; }
      if (loading) return;
      loading = true;
      const button = document.querySelector('[data-view="3d"]');
      button.disabled = true;
      button.textContent = '3D 불러오는 중…';
      try {
        if (!scene) {
          const { createScene } = await import('./scene.js');
          if (requested !== '3d') return;
          scene = createScene(canvas, handleFailure);
        }
        if (requested !== '3d') return;
        canvas.hidden = false;
        diagramElement.hidden = true;
        status.hidden = true;
        document.querySelectorAll('.anatomy-label').forEach(el => el.hidden = false);
        document.querySelector('.scene-guidance').textContent = '드래그하여 회전 · 스크롤하여 확대';
        document.querySelector('#rotate').disabled = false;
        document.querySelector('#reset-view').disabled = false;
        scene.reset();
        scene.setState(state);
        diagram.setState({ ...state, playing: false });
      } catch (error) {
        handleFailure();
      } finally {
        loading = false;
        button.disabled = false;
        button.textContent = '3D 모델';
      }
    },
    rotate(value) { scene?.rotate(value); },
    reset() { requested = 'front'; scene?.reset(); showDiagram(); },
  };
}
