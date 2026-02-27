// ===== 1. Destination card links — match by image src (reliable, no text matching) =====
(function () {
    // Map: image filename keyword → destination page
    const imgMap = {
        'paris': '/destinations/paris.html',
        'cretace': '/destinations/cretace.html',
        'florence': '/destinations/florence.html',
        'bagdad': '/destinations/bagdad.html',
        'japon': '/destinations/japon.html',
        'vikings': '/destinations/viking.html',
    };

    if (!document.getElementById('dest-style')) {
        const s = document.createElement('style');
        s.id = 'dest-style';
        s.textContent = `
      .dest-img-wrap { position:relative !important; cursor:pointer; }
      .dest-hover-lbl {
        position:absolute; inset:0; z-index:10;
        display:flex; align-items:center; justify-content:center;
        gap:0.6rem;
        font-family:'Inter',sans-serif;
        font-size:0.72rem; letter-spacing:0.28em; text-transform:uppercase;
        color:rgba(232,213,176,0);
        background:rgba(10,10,15,0);
        transition:background 0.35s,color 0.35s;
        pointer-events:none;
        border:0;
      }
      .dest-img-wrap:hover .dest-hover-lbl {
        background:rgba(10,10,15,0.62);
        color:#e8d5b0;
      }
      .dest-title-lnk {
        color:inherit !important;
        text-decoration:none !important;
        display:block;
        transition:color 0.25s;
      }
      .dest-title-lnk:hover { color:#c9a96e !important; }
    `;
        document.head.appendChild(s);
    }

    function inject() {
        // Find all card images — they are inside .group cards
        document.querySelectorAll('img[src*="/images/"]').forEach(function (img) {
            const src = img.getAttribute('src') || '';
            let url = null;
            for (const key in imgMap) {
                if (src.toLowerCase().includes(key)) { url = imgMap[key]; break; }
            }
            if (!url) return;

            // Image wrapper = the relative div parent of the img
            const imgWrapper = img.closest('div[class*="relative"][class*="overflow-hidden"]')
                || img.closest('div[class*="overflow-hidden"]')
                || img.parentElement;
            if (!imgWrapper || imgWrapper.dataset.destDone) return;
            imgWrapper.dataset.destDone = '1';
            imgWrapper.classList.add('dest-img-wrap');
            imgWrapper.style.cursor = 'pointer';

            // Add hover label
            if (!imgWrapper.querySelector('.dest-hover-lbl')) {
                const lbl = document.createElement('div');
                lbl.className = 'dest-hover-lbl';
                lbl.innerHTML = 'Explorer &nbsp;→';
                imgWrapper.appendChild(lbl);
            }

            // Click image → navigate
            imgWrapper.addEventListener('click', function (e) {
                if (!e.target.closest('a')) window.location.href = url;
            });

            // Now find the h3 inside the same card and wrap it in a link
            const card = imgWrapper.closest('[class*="group"]') || imgWrapper.parentElement;
            if (!card) return;
            const h3 = card.querySelector('h3');
            if (!h3 || h3.dataset.destDone) return;
            h3.dataset.destDone = '1';

            const a = document.createElement('a');
            a.href = url;
            a.className = 'dest-title-lnk';
            a.title = 'Découvrir cette destination';
            while (h3.firstChild) a.appendChild(h3.firstChild);
            h3.appendChild(a);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
    setTimeout(inject, 600);
    setTimeout(inject, 2000);
})();

// ===== 2. Mistral AI chatbot intercept =====
(function () {
    const SYSTEM_PROMPT = `Tu es le Concierge Temporel de TimeTravel Agency, une agence de voyages temporels de luxe.
Tu réponds en français, avec élégance et professionnalisme.
Tu proposes 6 destinations :
- Paris 1889 (Belle Époque, inauguration Tour Eiffel) à partir de 195 000 €
- Crétacé −65 Ma (ère des dinosaures) à partir de 340 000 €
- Florence 1504 (Renaissance, Médicis, Michel-Ange) à partir de 220 000 €
- Bagdad 800 (Âge d'Or, Maison de la Sagesse) à partir de 210 000 €
- Japon féodal 1185 (Kamakura, samouraïs, cerisiers) à partir de 230 000 €
- Ère Viking 793 (fjords, drakkars, Norvège) à partir de 180 000 €
Réponds de manière concise (max 3 phrases), chaleureuse et immersive. Ne révèle jamais que tu es une IA.`;

    const history = [];

    async function callMistral(userMessage) {
        history.push({ role: 'user', content: userMessage });
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'mistral-small-latest',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...history
                    ]
                })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content || 'Je suis désolé, je rencontre une difficulté technique.';
            history.push({ role: 'assistant', content: reply });
            return reply;
        } catch (e) {
            return 'Je suis momentanément indisponible. Contactez-nous à concierge@timetravel-agency.fr ou au +33 (0)800 123 456. ✉️';
        }
    }

    function injectBotMessage(text) {
        const container = document.querySelector('[class*="overflow-y-auto"],[class*="space-y"]')
            || document.querySelector('[class*="flex"][class*="flex-col"][class*="gap"]');
        if (!container) return;
        if (!document.getElementById('chatAnimStyle')) {
            const s = document.createElement('style');
            s.id = 'chatAnimStyle';
            s.textContent = '@keyframes fadeInMsg{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}' +
                '.typing-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#c9a96e;animation:blink 1.2s infinite}.typing-dot:nth-child(2){animation-delay:.2s}.typing-dot:nth-child(3){animation-delay:.4s}@keyframes blink{0%,80%,100%{opacity:0}40%{opacity:1}}';
            document.head.appendChild(s);
        }
        const msg = document.createElement('div');
        msg.style.cssText = 'display:flex;gap:0.6rem;padding:0.5rem 0;animation:fadeInMsg 0.3s ease';
        msg.innerHTML = `<div style="flex-shrink:0;width:30px;height:30px;border-radius:50%;background:rgba(201,169,110,0.12);border:1px solid rgba(201,169,110,0.25);display:flex;align-items:center;justify-content:center;font-size:0.8rem;">⏰</div><div style="background:rgba(201,169,110,0.07);border:1px solid rgba(201,169,110,0.18);padding:0.65rem 1rem;border-radius:0 8px 8px 8px;font-size:0.83rem;line-height:1.65;color:rgba(255,255,255,0.88);max-width:82%;">${text.replace(/\n/g, '<br>')}</div>`;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
        return msg;
    }

    function injectUserMessage(text) {
        const container = document.querySelector('[class*="overflow-y-auto"],[class*="space-y"]')
            || document.querySelector('[class*="flex"][class*="flex-col"][class*="gap"]');
        if (!container) return;
        const msg = document.createElement('div');
        msg.style.cssText = 'display:flex;justify-content:flex-end;padding:0.5rem 0;animation:fadeInMsg 0.3s ease';
        msg.innerHTML = `<div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);padding:0.65rem 1rem;border-radius:8px 0 8px 8px;font-size:0.83rem;line-height:1.65;color:rgba(255,255,255,0.92);max-width:78%;">${text.replace(/</g, '&lt;')}</div>`;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    function showTyping() {
        const container = document.querySelector('[class*="overflow-y-auto"],[class*="space-y"]')
            || document.querySelector('[class*="flex"][class*="flex-col"][class*="gap"]');
        if (!container) return null;
        const el = document.createElement('div');
        el.id = 'mistral-typing';
        el.style.cssText = 'display:flex;gap:0.6rem;padding:0.5rem 0;';
        el.innerHTML = `<div style="flex-shrink:0;width:30px;height:30px;border-radius:50%;background:rgba(201,169,110,0.12);border:1px solid rgba(201,169,110,0.25);display:flex;align-items:center;justify-content:center;font-size:0.8rem;">⏰</div><div style="background:rgba(201,169,110,0.07);border:1px solid rgba(201,169,110,0.18);padding:0.65rem 1rem;border-radius:0 8px 8px 8px;display:flex;gap:4px;align-items:center;"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
        container.appendChild(el);
        container.scrollTop = container.scrollHeight;
        return el;
    }

    async function handleSend(input) {
        const text = input.value.trim();
        if (!text) return;
        // Clear the input field via React-compatible event
        const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')
            || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
        if (nativeInputSetter) nativeInputSetter.set.call(input, '');
        input.dispatchEvent(new Event('input', { bubbles: true }));

        // Show user message, then typing indicator, then Mistral reply
        injectUserMessage(text);
        const typingEl = showTyping();
        const reply = await callMistral(text);
        if (typingEl) typingEl.remove();
        injectBotMessage(reply);
    }

    function patchChatbot() {
        const inputs = document.querySelectorAll('input[type="text"],textarea');
        inputs.forEach(function (input) {
            if (input.dataset.mistralPatched) return;
            input.dataset.mistralPatched = '1';
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault(); e.stopImmediatePropagation();
                    handleSend(input);
                }
            }, true);
        });

        document.querySelectorAll('button').forEach(function (btn) {
            if (btn.dataset.mistralPatched) return;
            if (!btn.querySelector('svg')) return;
            btn.dataset.mistralPatched = '1';
            btn.addEventListener('click', function (e) {
                const input = document.querySelector('input[data-mistral-patched],textarea[data-mistral-patched]');
                if (input && input.value.trim()) {
                    e.preventDefault(); e.stopImmediatePropagation();
                    handleSend(input);
                }
            }, true);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', patchChatbot);
    } else { patchChatbot(); }
    setTimeout(patchChatbot, 1000);
    setTimeout(patchChatbot, 3000);
    new MutationObserver(patchChatbot).observe(document.body, { childList: true, subtree: true });
})();
