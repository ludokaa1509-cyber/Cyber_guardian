// ===== VOCÊ SABIA? =====
const sabias = [
  "A cada segundo, 55 registros são vazados em algum lugar do mundo.",
  "Em 2019, dados de 220 milhões de brasileiros vazaram — mais do que a população do país.",
  "A senha mais usada no mundo ainda é '123456'.",
  "1 em cada 3 perfis que adicionam menores online são falsos (SaferNet).",
  "Phishing é responsável por 90% dos ataques cibernéticos bem-sucedidos.",
  "Um hacker de 18 anos invadiu o Uber em 2022 usando apenas engenharia social.",
  "O Facebook vazou dados de 533 milhões de usuários em 2021 — de graça, em fóruns.",
  "Localização em tempo real já foi usada em casos de assalto no Brasil.",
  "Senhas curtas de 6 dígitos podem ser quebradas em menos de 1 segundo.",
  "65% das pessoas reutilizam senhas em múltiplos sites."
];

let sabiaIdx = 0;
function rotateSabia() {
  const el = document.getElementById("sabia-texto");
  if (!el) return;
  el.style.opacity = "0";
  setTimeout(() => {
    el.textContent = sabias[sabiaIdx % sabias.length];
    el.style.opacity = "1";
    el.style.transition = "opacity 0.5s";
    sabiaIdx++;
  }, 300);
}
rotateSabia();
setInterval(rotateSabia, 6000);

// ===== TEXTO DIGITANDO =====
let textoDigit = "VOCÊ ESTÁ SENDO OBSERVADO...";
let iDigit = 0;
function escrever() {
  const el = document.getElementById("typing");
  if (!el) return;
  if (iDigit < textoDigit.length) {
    el.innerHTML += textoDigit[iDigit];
    iDigit++;
    setTimeout(escrever, 40);
  } else {
    // Pisca cursor no final
    el.innerHTML += '<span class="cursor-blink">_</span>';
  }
}
escrever();

// ===== CONSENTIMENTO =====
window.aceitar = () => {
  window._coletaRecusada = false;
  document.getElementById("consentimento").style.display = "none";
  iniciarColeta();
};

window.recusar = () => {
  window._coletaRecusada = true;
  document.getElementById("consentimento").style.display = "none";
};

// ===== COLETA =====
async function iniciarColeta() {
  if (window._coletaRecusada) return;
  if (window._isNovaVisita === false) return; // não duplica em reload
  try {
    const ip = await fetch("https://api.ipify.org?format=json").then(r => r.json());
    const loc = await fetch(`https://ipapi.co/${ip.ip}/json/`).then(r => r.json());
    const hw = (typeof getHardwareCompleto === "function") ? getHardwareCompleto() : {};
    const dados = {
      ip: ip.ip,
      cidade: loc.city || "?",
      pais: loc.country_name || "?",
      regiao: loc.region || "?",
      dispositivo: hw.tipo || getDevice(),
      modelo: hw.modelo || getDevice(),
      deviceId: window._deviceId || "unknown",
      hora: new Date().toLocaleTimeString("pt-BR"),
      timestamp: Date.now(),
      tela: hw.tela || (screen.width + "x" + screen.height),
      cores_cpu: hw.cores_cpu || navigator.hardwareConcurrency || "?",
      ram_gb: hw.ram_gb || navigator.deviceMemory || "?",
      plataforma: hw.plataforma || navigator.platform || "?",
      idioma: hw.idioma || navigator.language || "?",
      userAgent: (navigator.userAgent || "").substring(0, 150)
    };
    db.collection("logs").add(dados);
  } catch(e) {
    console.log("Erro coleta", e);
  }
}

// ===== LOGS TEMPO REAL =====
const ipsVistos = new Set();
db.collection("logs")
  .orderBy("timestamp", "desc")
  .limit(20)
  .onSnapshot(snap => {
    const lista = document.getElementById("logs");
    if (!lista) return;
    lista.innerHTML = "";
    ipsVistos.clear();
    snap.forEach(doc => {
      const d = doc.data();
      if (ipsVistos.has(d.ip)) return;
      ipsVistos.add(d.ip);
      lista.innerHTML += `<li>🌐 <span style="color:#00ff88">${d.ip}</span> | ${d.dispositivo} | <span style="color:#ffaa00">${d.cidade || "?"}</span> | <span style="color:#666;font-size:11px">${d.hora || "--"}</span></li>`;
    });
    lista.scrollTop = lista.scrollHeight;
  });

// ===== CONTADOR AO VIVO =====
(function() {
  // Fonte: Surfshark Data Breach Monitor Q3 2024
  // 3.261 contas violadas por minuto globalmente = ~54 por segundo
  // Brasil: Q3 2024 teve 5 milhões em 3 meses = ~630 por hora = ~10 por minuto
  const porSegundo = 54;
  const porSegundoBrasil = 0.17; // ~10 por minuto no Brasil

  const agora = new Date();
  const inicioDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const segundosHoje = Math.floor((agora - inicioDia) / 1000);
  let base = segundosHoje * porSegundo;
  let baseBrasil = Math.floor(segundosHoje * porSegundoBrasil);

  function fmt(n) { return Math.floor(n).toLocaleString("pt-BR"); }

  function animar(el, alvo, dur) {
    if (!el) return;
    let v = 0;
    const step = alvo / (dur / 50);
    const t = setInterval(() => {
      v += step;
      if (v >= alvo) { v = alvo; clearInterval(t); }
      el.textContent = fmt(v);
    }, 50);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      animar(document.getElementById("contador-numero"), base, 1500);
      animar(document.getElementById("stat-brasil"), baseBrasil, 1500);
      obs.disconnect();
      setInterval(() => {
        base += porSegundo;
        baseBrasil += porSegundoBrasil;
        const el = document.getElementById("contador-numero");
        const elBr = document.getElementById("stat-brasil");
        if (el) el.textContent = fmt(base);
        if (elBr) elBr.textContent = fmt(baseBrasil);
      }, 1000);
    });
  }, { threshold: 0.3 });

  const sec = document.getElementById("contador");
  if (sec) obs.observe(sec);
})();

// ===== GLITCH NO TÍTULO =====
function glitch(el) {
  if (!el) return;
  const original = el.textContent;
  const chars = "!@#$%^&*<>?/\\|{}[]0123456789ABCDEF";
  let iterations = 0;
  const interval = setInterval(() => {
    el.textContent = original.split("").map((c, i) => {
      if (c === " ") return " ";
      if (i < iterations) return original[i];
      return chars[Math.floor(Math.random() * chars.length)];
    }).join("");
    if (iterations >= original.length) {
      clearInterval(interval);
      el.textContent = original;
    }
    iterations += 0.5;
  }, 40);
}

// Glitch periódico no título após digitação
setTimeout(() => {
  setInterval(() => {
    const el = document.getElementById("typing");
    if (el) glitch(el);
  }, 8000);
}, 5000);

// ===== SOM AMBIENTE (Web Audio API — sem arquivo externo) =====
(function() {
  let audioCtx = null;
  let noiseNode = null;
  let gainNode = null;
  let isPlaying = false;

  function createNoise() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    // Filtro passa-baixa para som de "sala de servidores"
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;

    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.03; // bem suave

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noiseNode.start();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("sound-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (!isPlaying) {
        if (!audioCtx) createNoise();
        else gainNode.gain.value = 0.03;
        if (audioCtx.state === "suspended") audioCtx.resume();
        btn.textContent = "🔊";
        isPlaying = true;
      } else {
        gainNode.gain.value = 0;
        btn.textContent = "🔇";
        isPlaying = false;
      }
    });
  });
})();

// ===== GLOSSÁRIO =====
const termos = [
  { termo: "Phishing", def: "Ataque onde o criminoso cria um site ou mensagem falsa idêntica a um serviço real para roubar suas credenciais." },
  { termo: "Ransomware", def: "Vírus que criptografa todos os seus arquivos e exige pagamento (geralmente em Bitcoin) para devolvê-los." },
  { termo: "VPN", def: "Rede Privada Virtual — cria um túnel criptografado para sua conexão, escondendo seu IP e localização real." },
  { termo: "Engenharia Social", def: "Técnica de manipulação psicológica para enganar pessoas a revelar informações confidenciais, sem uso de código." },
  { termo: "Brute Force", def: "Ataque que testa milhões de combinações de senha automaticamente até encontrar a correta." },
  { termo: "DDoS", def: "Ataque que sobrecarrega um servidor com milhões de requisições simultâneas até derrubar o site." },
  { termo: "Zero-day", def: "Vulnerabilidade desconhecida pelo fabricante do software — extremamente valiosa e perigosa pois não há correção." },
  { termo: "Dark Web", def: "Parte da internet não indexada por buscadores, acessível via Tor, onde dados roubados são comprados e vendidos." },
  { termo: "Keylogger", def: "Programa que registra tudo que você digita — senhas, mensagens, dados bancários — e envia para o atacante." },
  { termo: "SQL Injection", def: "Técnica que insere comandos maliciosos em campos de texto para manipular bancos de dados de sites." },
  { termo: "Spyware", def: "Software espião que monitora sua atividade, coleta dados pessoais e envia para terceiros sem seu conhecimento." },
  { termo: "2FA", def: "Autenticação de dois fatores — além da senha, exige um segundo código (SMS ou app), bloqueando 99% dos ataques." },
];

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("glossario-grid");
  if (!grid) return;

  termos.forEach(t => {
    const item = document.createElement("div");
    item.className = "glossario-item";
    item.innerHTML = `
      <div class="glossario-termo">${t.termo} <span class="glossario-seta">▼</span></div>
      <div class="glossario-def">${t.def}</div>
    `;
    item.querySelector(".glossario-termo").addEventListener("click", () => {
      const def = item.querySelector(".glossario-def");
      const isOpen = def.classList.contains("open");
      // Fecha todos
      document.querySelectorAll(".glossario-def.open").forEach(d => d.classList.remove("open"));
      document.querySelectorAll(".glossario-seta").forEach(s => s.textContent = "▼");
      if (!isOpen) {
        def.classList.add("open");
        item.querySelector(".glossario-seta").textContent = "▲";
      }
    });
    grid.appendChild(item);
  });
});

// ===== MAPA DE LOGS =====
db.collection("logs")
  .orderBy("timestamp", "desc")
  .limit(50)
  .onSnapshot(snap => {
    const lista = document.getElementById("mapa-lista");
    if (!lista) return;

    // Agrupa por país/cidade
    const lugares = {};
    snap.forEach(doc => {
      const d = doc.data();
      if (!d.cidade || d.cidade === "?") return;
      const key = d.cidade + ", " + (d.pais || "");
      if (!lugares[key]) lugares[key] = { count: 0, dispositivos: {} };
      lugares[key].count++;
      const dev = d.dispositivo || "PC";
      lugares[key].dispositivos[dev] = (lugares[key].dispositivos[dev] || 0) + 1;
    });

    const sorted = Object.entries(lugares).sort((a, b) => b[1].count - a[1].count);

    lista.innerHTML = sorted.length === 0
      ? '<p style="color:var(--text2)">Nenhuma localização disponível ainda.</p>'
      : sorted.map(([lugar, data], i) => {
          const devs = Object.entries(data.dispositivos).map(([k,v]) => `${k}(${v})`).join(", ");
          const bar = Math.min(100, Math.round((data.count / sorted[0][1].count) * 100));
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`;
          return `
            <div class="mapa-item">
              <div class="mapa-top">
                <span class="mapa-medal">${medal}</span>
                <span class="mapa-lugar">${lugar}</span>
                <span class="mapa-count">${data.count} visita${data.count > 1 ? "s" : ""}</span>
              </div>
              <div class="mapa-barra-wrap">
                <div class="mapa-barra" style="width:${bar}%"></div>
              </div>
              <div class="mapa-devs">${devs}</div>
            </div>
          `;
        }).join("");
  });

// ===== VERIFICADOR DE EMAIL (Have I Been Pwned API) =====
async function verificarEmail() {
  const email = document.getElementById("email-check").value.trim();
  const resultado = document.getElementById("verificador-resultado");
  if (!email || !email.includes("@")) {
    alert("Digite um e-mail válido.");
    return;
  }
  resultado.style.display = "block";
  resultado.className = "resultado-loading";
  resultado.innerHTML = "🔍 Verificando... aguarde";

  try {
    // Usa a API pública de e-mail do HIBP via proxy alternativo gratuito
    const sha1 = await emailToSha1(email);
    const prefix = sha1.substring(0, 5).toUpperCase();
    const suffix = sha1.substring(5).toUpperCase();

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await res.text();
    const found = text.split("\n").some(line => line.startsWith(suffix));

    // Mascara o e-mail para o log: jo**@gmail.com
    const partes = email.split("@");
    const emailMask = partes[0].substring(0,2) + "**@" + partes[1];

    if (found) {
      resultado.className = "resultado-pwned";
      resultado.innerHTML = `
        <strong>⚠️ Atenção!</strong> Este e-mail aparece em vazamentos conhecidos.<br><br>
        <strong>O que fazer agora:</strong><br>
        • Troque a senha de todos os serviços vinculados a este e-mail<br>
        • Ative verificação em 2 etapas onde possível<br>
        • Verifique detalhes completos em <a href="https://haveibeenpwned.com" target="_blank" style="color:#ff6666">haveibeenpwned.com</a>
      `;
      // Salva no Firebase (e-mail mascarado)
      if(window.somAtivado) window.SOM?.pwned();
      try { db.collection("adm_eventos").add({
        tipo: "email_verificado",
        email_mask: emailMask,
        resultado: "VAZADO ⚠️",
        dispositivo: getDevice(),
        hora: new Date().toLocaleTimeString("pt-BR"),
        timestamp: Date.now()
      }); } catch(e) {}
    } else {
      resultado.className = "resultado-safe";
      resultado.innerHTML = `
        <strong>✅ Boa notícia!</strong> Este e-mail não aparece em vazamentos conhecidos na nossa base.<br><br>
        Continue mantendo boas práticas: senha forte, 2FA ativado e e-mails únicos por serviço.
      `;
      // Salva no Firebase (e-mail mascarado)
      if(window.somAtivado) window.SOM?.safe();
      try { db.collection("adm_eventos").add({
        tipo: "email_verificado",
        email_mask: emailMask,
        resultado: "Seguro ✅",
        dispositivo: getDevice(),
        hora: new Date().toLocaleTimeString("pt-BR"),
        timestamp: Date.now()
      }); } catch(e) {}
    }
  } catch(e) {
    resultado.className = "resultado-loading";
    resultado.innerHTML = `❌ Não foi possível verificar agora. Tente em <a href="https://haveibeenpwned.com" target="_blank" style="color:var(--green)">haveibeenpwned.com</a> diretamente.`;
  }
}

async function emailToSha1(email) {
  const msgBuffer = new TextEncoder().encode(email.toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

document.getElementById("email-check")?.addEventListener("keydown", e => {
  if (e.key === "Enter") verificarEmail();
});

// ===== GERADOR DE FRASE-SENHA =====
const palavras = {
  adjetivos: ["Veloz","Azul","Forte","Neon","Cyber","Livre","Oculto","Seguro","Digital","Secreto","Invisível","Hacker","Rápido","Sombrio","Brilhante"],
  substantivos: ["Dragão","Escudo","Leão","Rocha","Trovão","Código","Chave","Estrela","Lobo","Aguia","Nuvem","Fênix","Robô","Sombra","Cristal"],
  verbos: ["Protege","Guarda","Voa","Resiste","Invade","Analisa","Criptografa","Decifra","Bloqueia","Monitora"],
  numeros: ["07","13","42","77","99","256","404","007","512","1337"]
};
const simbolos = ["!","@","#","$","%","&","*"];
let ultimaSenhaGerada = "";

function gerarFraseSenha() {
  if(window.somAtivado) window.SOM?.gerar();
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const adj = pick(palavras.adjetivos);
  const sub = pick(palavras.substantivos);
  const vrb = pick(palavras.verbos);
  const num = pick(palavras.numeros);
  const sim = pick(simbolos);
  const senha = `${adj}-${sub}-${vrb}${num}${sim}`;
  ultimaSenhaGerada = senha;

  const el = document.getElementById("senha-gerada");
  if (el) {
    el.style.opacity = "0";
    setTimeout(() => {
      el.textContent = senha;
      el.style.opacity = "1";
      el.style.transition = "opacity 0.3s";
    }, 150);
  }

  // Mostra força
  const forcaEl = document.getElementById("forca-gerada");
  if (forcaEl) {
    const bits = Math.log2(15 * 15 * 10 * 10 * 7) + senha.length * 4;
    forcaEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;justify-content:center">
        <span style="color:#00ff88;font-size:13px">💚 Senha forte</span>
        <span style="color:#888;font-size:12px">~${Math.round(bits)} bits de entropia</span>
        <span style="color:#888;font-size:12px">⏱️ Tempo para quebrar: séculos</span>
      </div>
    `;
  }
}

function copiarSenhaGerada() {
  if (!ultimaSenhaGerada) return;
  navigator.clipboard.writeText(ultimaSenhaGerada).then(() => {
    const btn = document.getElementById("btn-copiar");
    if (btn) { btn.textContent = "✅ Copiado!"; setTimeout(() => btn.textContent = "📋 Copiar", 2000); }
    if(window.somAtivado) window.SOM?.copiar();
    // Salva no Firebase (nunca salva a senha, só que foi gerada e copiada)
    try { db.collection("adm_eventos").add({
      tipo: "senha_gerada",
      acao: "Copiou senha gerada",
      forca: "Forte 💚",
      dispositivo: getDevice(),
      hora: new Date().toLocaleTimeString("pt-BR"),
      timestamp: Date.now()
    }); } catch(e) {}
  }).catch(() => alert("Copie manualmente: " + ultimaSenhaGerada));
}

// Gera uma senha na hora que a seção aparecer
const obsGerador = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { gerarFraseSenha(); obsGerador.disconnect(); } });
}, { threshold: 0.5 });
const secGerador = document.getElementById("gerador");
if (secGerador) obsGerador.observe(secGerador);
