//  CARROSSEL 
const carrossel = document.querySelector(".carrossel");
const btnEsq = document.querySelector(".carrossel-btn.esquerda");
const btnDir = document.querySelector(".carrossel-btn.direita");
const indicadoresContainer = document.querySelector(".carrossel-indicadores");

const itensOriginais = Array.from(carrossel.querySelectorAll(".item"));
const total = itensOriginais.length;
let index = total; // Começa no meio dos clones
let isTransitioning = false;

// Calcula itens visíveis baseado na largura da tela
const getItensPorTela = () => {
    const width = window.innerWidth;
    return width <= 640 ? 1 : width <= 1024 ? 2 : 3;
};

// Cria clones antes e depois
const criarClones = () => {
    const fragment1 = document.createDocumentFragment();
    const fragment2 = document.createDocumentFragment();
    
    itensOriginais.forEach(item => {
        fragment1.appendChild(item.cloneNode(true));
        fragment2.appendChild(item.cloneNode(true));
    });
    
    carrossel.insertBefore(fragment1, carrossel.firstChild);
    carrossel.appendChild(fragment2);
};

// Cria indicadores
const criarIndicadores = () => {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < total; i++) {
        const btn = document.createElement('button');
        btn.className = 'indicador';
        btn.onclick = () => irPara(i);
        btn.setAttribute('aria-label', `Ir para slide ${i + 1}`);
        fragment.appendChild(btn);
    }
    indicadoresContainer.appendChild(fragment);
};

// Calcula offset do carrossel
const calcularOffset = (idx) => {
    const porTela = getItensPorTela();
    const largura = itensOriginais[0].offsetWidth;
    const gap = porTela === 1 ? 20 : 30;
    const containerWidth = carrossel.parentElement.offsetWidth;

    if (porTela === 1) {
        // Mobile: centraliza cada item perfeitamente
        return (idx * (largura + gap)) - ((containerWidth - largura) / 2);
    } else if (porTela === 2) {
        return idx * (largura + gap);
    } else {
        return idx * (largura + gap) - (containerWidth / 2) + (largura / 2);
    }
};

// Atualiza posição do carrossel
const atualizar = (instant = false) => {
    const porTela = getItensPorTela();
    const todosItens = carrossel.querySelectorAll(".item");
    const offset = calcularOffset(index);

    carrossel.style.transition = instant ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    carrossel.style.transform = `translateX(-${offset}px)`;

    // Atualiza classes
    todosItens.forEach(item => item.classList.remove('center'));
    if (porTela === 3 && todosItens[index]) {
        todosItens[index].classList.add('center');
    }

    // Atualiza indicadores
    const indiceReal = ((index - total) % total + total) % total;
    document.querySelectorAll('.indicador').forEach((ind, i) => {
        ind.classList.toggle('ativo', i === indiceReal);
    });
};

// Reset invisível quando necessário
const resetSeNecessario = () => {
    // Se passou do último clone, volta pro original sem transição
    if (index >= total * 2) {
        index = total;
        atualizar(true);
    }
    // Se passou do primeiro clone, volta pro original sem transição
    else if (index <= 0) {
        index = total;
        atualizar(true);
    }
};

// Navegação
const avancar = () => {
    if (isTransitioning) return;
    isTransitioning = true;
    index++;
    atualizar();
    
    // Aguarda a transição terminar antes de verificar reset
    setTimeout(() => {
        resetSeNecessario();
        isTransitioning = false;
    }, 650);
};

const voltar = () => {
    if (isTransitioning) return;
    isTransitioning = true;
    index--;
    atualizar();
    
    // Aguarda a transição terminar antes de verificar reset
    setTimeout(() => {
        resetSeNecessario();
        isTransitioning = false;
    }, 650);
};

const irPara = (i) => {
    if (isTransitioning) return;
    isTransitioning = true;
    index = total + i;
    atualizar();
    setTimeout(() => isTransitioning = false, 650);
};

// Event listeners
btnDir.addEventListener("click", avancar);
btnEsq.addEventListener("click", voltar);

// Touch/Swipe
let touchStart = 0;
carrossel.addEventListener('touchstart', e => touchStart = e.touches[0].clientX, {passive: true});
carrossel.addEventListener('touchend', e => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? avancar() : voltar();
}, {passive: true});

// Teclado
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') voltar();
    if (e.key === 'ArrowRight') avancar();
});

// Resize
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => atualizar(true), 250);
});

// Auto-play
let autoPlay = setInterval(avancar, 5000);
carrossel.addEventListener('mouseenter', () => clearInterval(autoPlay));
carrossel.addEventListener('mouseleave', () => autoPlay = setInterval(avancar, 5000));

// Inicializar
criarClones();
criarIndicadores();
setTimeout(() => atualizar(true), 50);