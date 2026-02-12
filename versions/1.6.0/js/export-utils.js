/* export-utils.js - CSV and PDF export for question logs */

const ExportUtils = {

    // Export question log as CSV
    exportCSV(playerId, playerName) {
        const questions = Storage.getQuestionLog(playerId);
        if (!questions.length) {
            alert('No question data to export.');
            return;
        }

        const headers = ['Date', 'Strategy', 'Question', 'Student Answer', 'Correct Answer', 'Correct', 'Time (s)', 'Hint Shown'];
        const rows = questions.map(q => {
            const strat = STRATEGIES.find(s => s.id === q.strategyId);
            return [
                new Date(q.timestamp || q.date).toLocaleString('en-GB'),
                strat ? strat.shortName : q.strategyId,
                q.questionText,
                q.userAnswer,
                q.correctAnswer,
                q.correct ? 'Yes' : 'No',
                (q.timeMs / 1000).toFixed(1),
                q.hintShown ? 'Yes' : 'No',
            ];
        });

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        this._download(csvContent, `mental-maths-${playerName}-${this._dateStr()}.csv`, 'text/csv');
    },

    // Export question log as printable PDF (via print dialog)
    exportPDF(playerId, playerName) {
        const questions = Storage.getQuestionLog(playerId);
        const profile = Storage.getProfile(playerId);
        const allProg = Storage.getAllStrategyProgress(playerId);

        if (!questions.length) {
            alert('No question data to export.');
            return;
        }

        const accuracy = profile.totalQuestions > 0
            ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100) : 0;

        let stratSummary = '';
        STRATEGIES.forEach(s => {
            const p = allProg[s.id];
            if (p && p.totalAttempts > 0) {
                const sAcc = p.totalAttempts > 0 ? Math.round((p.totalCorrect / p.totalAttempts) * 100) : 0;
                stratSummary += `<tr><td>${s.name}</td><td>L${p.level || 1}</td><td>${p.mastery || 0}%</td><td>${sAcc}%</td><td>${(p.avgTimeMs / 1000).toFixed(1)}s</td></tr>`;
            }
        });

        let questionRows = '';
        questions.slice(-100).forEach(q => {
            const strat = STRATEGIES.find(s => s.id === q.strategyId);
            questionRows += `<tr>
                <td>${new Date(q.timestamp || q.date).toLocaleString('en-GB')}</td>
                <td>${strat ? strat.shortName : q.strategyId}</td>
                <td>${q.questionText}</td>
                <td>${q.userAnswer}</td>
                <td>${q.correctAnswer}</td>
                <td style="color:${q.correct ? '#2e7d32' : '#c62828'}">${q.correct ? 'Yes' : 'No'}</td>
                <td>${(q.timeMs / 1000).toFixed(1)}s</td>
            </tr>`;
        });

        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>Mental Maths Report - ${playerName}</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
            h1 { color: #2a9d8f; margin-bottom: 4px; }
            h2 { color: #555; margin-top: 24px; border-bottom: 2px solid #2a9d8f; padding-bottom: 4px; }
            .subtitle { color: #888; margin-bottom: 20px; }
            .overview { display: flex; gap: 24px; margin: 16px 0; }
            .stat { text-align: center; }
            .stat .val { font-size: 2rem; font-weight: 800; color: #2a9d8f; }
            .stat .lbl { font-size: 0.8rem; color: #888; }
            table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-top: 8px; }
            th, td { padding: 6px 10px; border-bottom: 1px solid #ddd; text-align: left; }
            th { background: #f5f5f5; font-weight: 600; }
            @media print { body { padding: 0; } }
        </style></head><body>
        <h1>Mental Maths Report</h1>
        <div class="subtitle">${playerName} — Generated ${new Date().toLocaleDateString('en-GB')}</div>
        <div class="overview">
            <div class="stat"><div class="val">${profile.totalSessions || 0}</div><div class="lbl">Sessions</div></div>
            <div class="stat"><div class="val">${profile.totalQuestions || 0}</div><div class="lbl">Questions</div></div>
            <div class="stat"><div class="val">${accuracy}%</div><div class="lbl">Accuracy</div></div>
        </div>
        <h2>Strategy Summary</h2>
        <table><tr><th>Strategy</th><th>Level</th><th>Mastery</th><th>Accuracy</th><th>Avg Time</th></tr>${stratSummary}</table>
        <h2>Question Log (Last 100)</h2>
        <table><tr><th>Date</th><th>Strategy</th><th>Question</th><th>Answer</th><th>Correct</th><th>Right?</th><th>Time</th></tr>${questionRows}</table>
        <script>window.onload=function(){window.print();}</script>
        </body></html>`;

        const w = window.open('', '_blank');
        if (w) {
            w.document.write(html);
            w.document.close();
        }
    },

    _download(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    _dateStr() {
        return new Date().toISOString().split('T')[0];
    },
};
