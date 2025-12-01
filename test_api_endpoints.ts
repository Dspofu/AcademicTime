// Using global fetch

// checking node version... assuming 18+ or using what's available.
// If node-fetch is not installed, I might need to rely on built-in fetch.
// Let's try built-in fetch first (global).

async function main() {
    const BASE_URL = 'http://localhost:3000';
    console.log('Starting API verification...');

    // 1. Test Settings (Public/Protected? Currently public based on code)
    try {
        console.log('Testing GET /settings...');
        const resSettings = await fetch(`${BASE_URL}/settings`);
        if (resSettings.status !== 200) throw new Error(`Failed to get settings: ${resSettings.status}`);
        const settings = await resSettings.json();
        console.log('Settings:', settings);
    } catch (e) {
        console.error('Settings test failed:', e);
    }

    // 2. Test Subject Create
    try {
        console.log('Testing POST /subjects...');
        const resSubject = await fetch(`${BASE_URL}/subjects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                codigo: 'TEST001',
                nome: 'Test Subject',
                carga_horaria_semestral: 60,
                aulas_por_semana_padrao: 4
            })
        });

        if (resSubject.status === 201) {
            const subject = await resSubject.json();
            console.log('Created Subject:', subject);

            // Clean up
            console.log('Cleaning up subject...');
            await fetch(`${BASE_URL}/subjects/${subject.id_disciplina}`, { method: 'DELETE' });
        } else {
            console.error(`Failed to create subject: ${resSubject.status}`);
            const err = await resSubject.text();
            console.error(err);
        }
    } catch (e) {
        console.error('Subject test failed:', e);
    }

    console.log('Verification finished.');
}

main();
