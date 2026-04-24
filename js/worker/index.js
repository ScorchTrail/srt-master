function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function sanitizeSubject(value = '') {
    return String(value).replace(/[\r\n]+/g, ' ').trim();
}

function getCorsOrigin(request, env) {
    const allowedOrigin = String(env.ALLOWED_ORIGIN || '').trim();
    const requestOrigin = request.headers.get('Origin') || '';

    if (!allowedOrigin) {
        return '';
    }

    return requestOrigin === allowedOrigin ? allowedOrigin : '';
}

export default {
    async fetch(request, env) {
        const configuredOrigin = String(env.ALLOWED_ORIGIN || '').trim();

        if (!configuredOrigin) {
            return new Response('Server misconfiguration', { status: 500 });
        }

        const corsOrigin = getCorsOrigin(request, env);

        if (!corsOrigin) {
            return new Response('Forbidden origin', { status: 403 });
        }

        const baseCorsHeaders = {
            'Access-Control-Allow-Origin': corsOrigin || 'null',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            Vary: 'Origin'
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: baseCorsHeaders
            });
        }

        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
        }

        if (!env.RESEND_API_KEY) {
            return new Response('Server misconfiguration', { status: 500 });
        }

        const leadFromEmail = String(env.LEAD_FROM_EMAIL || '').trim();
        const leadToEmail = String(env.LEAD_TO_EMAIL || '').trim();

        if (!leadFromEmail || !leadToEmail) {
            return new Response('Server misconfiguration', { status: 500 });
        }

        try {
            const body = await request.json();
            const { name, email, company, phone, status = 'Started Discovery Form', summary } = body;
            const subjectName = sanitizeSubject(name || 'Unknown');
            const safeName = escapeHtml(name);
            const safeEmail = escapeHtml(email);
            const safeCompany = escapeHtml(company);
            const safePhone = escapeHtml(phone);
            const safeStatus = escapeHtml(status);
            const safeSummary = summary ? escapeHtml(summary) : '';

            const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: leadFromEmail,
                    to: leadToEmail,
                    subject: `New Lead Started: ${subjectName}`,
                    html: `
                        <h2>New Discovery Form Started</h2>
                        <p><strong>Status:</strong> ${safeStatus}</p>
                        <p><strong>Name:</strong> ${safeName}</p>
                        <p><strong>Email:</strong> ${safeEmail}</p>
                        <p><strong>Phone:</strong> ${safePhone}</p>
                        <p><strong>Company:</strong> ${safeCompany}</p>
                        <hr>
                        <p><em>The visitor has completed the first step of the discovery form.</em></p>
                        ${safeSummary ? `<h3>Full Discovery Answers</h3><pre>${safeSummary}</pre>` : ''}
                    `,
                    text: [
                        'New Discovery Form Started',
                        `Status: ${status}`,
                        `Name: ${name}`,
                        `Email: ${email}`,
                        `Phone: ${phone}`,
                        `Company: ${company}`,
                        '',
                        summary ? `Full Discovery Answers:\n${summary}` : ''
                    ].filter(Boolean).join('\n')
                })
            });

            if (!resendResponse.ok) {
                return new Response(JSON.stringify({
                    error: 'Failed to send email',
                    providerStatus: resendResponse.status
                }), {
                    status: 502,
                    headers: {
                        ...baseCorsHeaders,
                        'Content-Type': 'application/json'
                    }
                });
            }

            return new Response(JSON.stringify({ success: true }), {
                headers: {
                    ...baseCorsHeaders,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            return new Response('Internal Server Error', {
                status: 500,
                headers: baseCorsHeaders
            });
        }
    }
};