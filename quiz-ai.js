// ===== Quiz AI Recommendation — powered by Mistral =====
(function () {
    const QUIZ_PROMPT = `Tu es l'IA de recommandation de TimeTravel Agency. 
L'utilisateur a répondu à 4 questions sur ses préférences de voyage temporel.
En fonction de ses réponses, recommande la destination la plus adaptée parmi :
- Paris 1889 (Belle Époque, Tour Eiffel, impressionnistes, élégance urbaine)
- Crétacé −65 Ma (dinosaures, nature préhistorique, aventure sauvage)
- Florence 1504 (Renaissance, art, Michel-Ange, Médicis, architecture)
- Bagdad 800 (Âge d'Or islamique, mathématiques, intellectuels, Maison de la Sagesse)
- Japon Féodal 1185 (samouraïs, zen, cerisiers, discipline, beauté)
- Ère Viking 793 (fjords, drakkars, guerriers nordiques, aventure épique)

Réponds en 3-4 phrases maximum avec :
1. Le nom de la destination recommandée en gras
2. Pourquoi c'est parfait pour ce profil
3. Une expérience emblématique qu'ils vivront
Sois enthousiaste et immersif.`;

    const destURLs = {
        'Paris': '/destinations/paris.html',
        'Crétacé': '/destinations/cretace.html',
        'Florence': '/destinations/florence.html',
        'Bagdad': '/destinations/bagdad.html',
        'Japon': '/destinations/japon.html',
        'Viking': '/destinations/viking.html',
    };

    async function getRecommendation(answers) {
        const userMsg = `Voici mes réponses au quiz :
1. Type d'expérience : ${answers[0]}
2. Période préférée : ${answers[1]}
3. Préférence : ${answers[2]}
4. Activité idéale : ${answers[3]}
Quelle destination me recommandes-tu ?`;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'mistral-small-latest',
                    messages: [
                        { role: 'system', content: QUIZ_PROMPT },
                        { role: 'user', content: userMsg }
                    ]
                })
            });
            const data = await res.json();
            return data.choices?.[0]?.message?.content || null;
        } catch (e) {
            return null;
        }
    }

    function showResult(container, answers, recommendation) {
        // Detect which destination was recommended
        let destKey = null, destURL = '#destinations';
        for (const key of Object.keys(destURLs)) {
            if (recommendation && recommendation.includes(key)) {
                destKey = key; destURL = destURLs[key]; break;
            }
        }

        container.innerHTML = `
      <div style="text-align:center;padding:2rem 0;">
        <div style="font-size:0.65rem;letter-spacing:0.4em;text-transform:uppercase;color:#c9a96e;margin-bottom:1rem;">Votre Destination Idéale</div>
        <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1.8rem;color:#fff;margin-bottom:1.5rem;line-height:1.3;">
          ${recommendation
                ? recommendation.replace(/\*\*([^*]+)\*\*/g, '<span style="color:#c9a96e;font-style:italic;">$1</span>')
                : 'Nous vous recommandons de discuter avec notre Concierge Temporel pour trouver votre destination idéale !'}
        </div>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2rem;">
          ${destURL !== '#destinations' ? `<a href="${destURL}" style="display:inline-flex;align-items:center;gap:0.5rem;background:#c9a96e;color:#0a0a0f;padding:0.85rem 2rem;font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;transition:background 0.2s;">Explorer cette destination →</a>` : ''}
          <button onclick="location.href='#quiz'" style="display:inline-flex;align-items:center;gap:0.5rem;border:1px solid rgba(201,169,110,0.4);color:rgba(255,255,255,0.7);background:transparent;padding:0.85rem 2rem;font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;cursor:pointer;">Refaire le quiz</button>
        </div>
      </div>
    `;
    }

    function patchQuiz() {
        const quizSection = document.getElementById('quiz');
        if (!quizSection || quizSection.dataset.quizPatched) return;

        const answers = [];
        let questionIndex = 0;

        function onAnswer(btn) {
            const answerText = btn.querySelector('span:last-child')?.textContent?.trim() || btn.textContent.trim();
            answers.push(answerText);
            questionIndex++;

            // After 4 answers, replace result area with Mistral recommendation
            if (answers.length === 4) {
                // Wait a tick for the React display to update, then inject
                setTimeout(async function () {
                    const resultArea = quizSection.querySelector('[class*="border"][class*="bg-card"]');
                    if (!resultArea || resultArea.dataset.resultShown) return;

                    // Show loading state
                    const originalContent = resultArea.innerHTML;
                    resultArea.innerHTML = `
            <div style="text-align:center;padding:3rem 1rem;">
              <div style="font-size:0.65rem;letter-spacing:0.4em;text-transform:uppercase;color:#c9a96e;margin-bottom:1.5rem;">Analyse de votre profil en cours...</div>
              <div style="display:flex;gap:6px;justify-content:center;">
                <span style="width:8px;height:8px;border-radius:50%;background:#c9a96e;animation:blink 1.2s infinite;"></span>
                <span style="width:8px;height:8px;border-radius:50%;background:#c9a96e;animation:blink 1.2s .2s infinite;"></span>
                <span style="width:8px;height:8px;border-radius:50%;background:#c9a96e;animation:blink 1.2s .4s infinite;"></span>
              </div>
            </div>`;
                    resultArea.dataset.resultShown = '1';

                    const rec = await getRecommendation(answers);
                    showResult(resultArea, answers, rec);
                }, 600);
            }
        }

        // Intercept all quiz button clicks
        quizSection.addEventListener('click', function (e) {
            const btn = e.target.closest('button');
            if (!btn) return;
            // Only intercept answer buttons (those with → arrows, not navigation)
            const span = btn.querySelector('span:first-child');
            if (span && span.textContent.includes('→')) {
                onAnswer(btn);
            }
        }, true);

        quizSection.dataset.quizPatched = '1';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', patchQuiz);
    } else { patchQuiz(); }
    setTimeout(patchQuiz, 1000);
    setTimeout(patchQuiz, 2500);
    new MutationObserver(patchQuiz).observe(document.body, { childList: true, subtree: true });
})();
