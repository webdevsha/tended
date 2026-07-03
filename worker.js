// --- CHIP-IN PUBLIC KEY (For Webhook Verification) ---
const CHIP_PUBLIC_KEY = `<API Key>`; // Replace with your actual Chip-in public key

// Helper: Verify Chip-in Webhook Signature using Web Crypto API
async function verifyChipSignature(signatureBase64, rawBodyBuffer) {
    try {
        const pemHeader = "-----BEGIN PUBLIC KEY-----";
        const pemFooter = "-----END PUBLIC KEY-----";
        const pemContents = CHIP_PUBLIC_KEY.substring(pemHeader.length, CHIP_PUBLIC_KEY.length - pemFooter.length).replace(/\s/g, '');
        
        const binaryDerString = atob(pemContents);
        const binaryDer = new Uint8Array(binaryDerString.length);
        for (let i = 0; i < binaryDerString.length; i++) {
            binaryDer[i] = binaryDerString.charCodeAt(i);
        }

        const key = await crypto.subtle.importKey(
            "spki",
            binaryDer,
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            false,
            ["verify"]
        );

        const signatureBytes = new Uint8Array(atob(signatureBase64).split("").map(c => c.charCodeAt(0)));

        return await crypto.subtle.verify(
            "RSASSA-PKCS1-v1_5",
            key,
            signatureBytes,
            rawBodyBuffer
        );
    } catch (e) {
        console.error("Signature verification error:", e);
        return false;
    }
}

// Helper: Centralized Brevo Email Dispatcher
async function sendBrevoEmailInternal(payload, env) {
    if (!env.BREVO_API_KEY) {
        throw new Error("Brevo API key is not configured in Cloudflare environment variables.");
    }

    const { user_name, user_email, total_amount, amount, items_purchased, file_name, file_content, sender_email, admin_email, email_subject } = payload;

    const adminDest = admin_email || env.ADMIN_EMAIL || "hai@shafiranoh.com";

    let displayAmount = total_amount;
    if (!displayAmount && amount) {
        displayAmount = 'RM ' + parseFloat(amount).toFixed(2);
    }
    if (!displayAmount) displayAmount = 'RM 0.00'; 

    const isThirtyThree = items_purchased && items_purchased.toLowerCase().includes("thirtythree_welcome");
    const isDeeptech = items_purchased && items_purchased.toLowerCase().includes("deeptech");
    const isBarter = items_purchased && items_purchased.toLowerCase().includes("barter");
    const isReflection = items_purchased && items_purchased.toLowerCase().includes("reflection");

    let fromEmail, fromName, finalSubject, emailHtml;

    // --- TEMPLATE ROUTING ---
    if (isThirtyThree) {
        fromEmail = "hai@shafiranoh.com";
        fromName  = "ThirtyThree";
        finalSubject = "Welcome to ThirtyThree";

        emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
        </head>
        <body style="font-family:'Inter',Helvetica,Arial,sans-serif;background:#fdfcf9;margin:0;padding:40px 20px;color:#1a1814;">
          <div style="max-width:580px;margin:0 auto;">

            <!-- wordmark -->
            <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;font-weight:400;color:#1a1814;letter-spacing:0.02em;margin:0 0 48px;">
              Thirty<span style="color:#b0a390;">Three</span>
            </p>

            <!-- hadith -->
            <blockquote style="border-left:2px solid #b0a390;padding-left:24px;margin:0 0 8px;">
              <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;font-weight:300;font-style:italic;line-height:1.55;color:#1a1814;margin:0;">
                "The people of Paradise will enter at the age of thirty-three."
              </p>
            </blockquote>
            <p style="font-size:11px;color:#8a857d;letter-spacing:0.06em;margin:0 0 40px 26px;">— Tirmidhi, Hadith 2545</p>

            <!-- greeting -->
            <p style="font-size:15px;line-height:1.75;color:#1a1814;margin:0 0 20px;">
              Assalamu alaykum ${user_name},
            </p>
            <p style="font-size:15px;line-height:1.75;color:#4a4640;margin:0 0 20px;">
              You are in. Welcome to the reading.
            </p>
            <p style="font-size:15px;line-height:1.75;color:#4a4640;margin:0 0 20px;">
              ThirtyThree is a newsletter for Muslim professionals asking a specific question:
              if thirty-three is the age of eternal flourishing — who are you becoming to get there?
            </p>

            <!-- what to expect box -->
            <div style="background:#f7f4ee;border-radius:6px;padding:28px 28px 20px;margin:0 0 32px;">
              <p style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#b0a390;font-weight:500;margin:0 0 16px;">What arrives in your inbox</p>
              <table style="border-collapse:collapse;width:100%;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #ddd7cc;vertical-align:top;">
                    <span style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7c5e;font-weight:500;">Weekly letter</span><br>
                    <span style="font-size:13px;color:#4a4640;line-height:1.6;">One reflection on character, career, or the long game. Grounded in Islamic scholarship. Readable in 5 minutes.</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #ddd7cc;vertical-align:top;">
                    <span style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7c5e;font-weight:500;">Reading notes</span><br>
                    <span style="font-size:13px;color:#4a4640;line-height:1.6;">What we are currently sitting with — Al-Ghazālī, Abdal-Hakim Murad, Ibn ʿArabī, and the occasional secular thinker in conversation with them.</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <span style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7c5e;font-weight:500;">No noise</span><br>
                    <span style="font-size:13px;color:#4a4640;line-height:1.6;">Once a week. No product pitches. No hustle mantras. The slow kind.</span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- first reflection teaser -->
            <p style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#b0a390;font-weight:500;margin:0 0 12px;">In the meantime — one question to sit with</p>
            <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:19px;font-weight:300;font-style:italic;line-height:1.6;color:#1a1814;border-left:2px solid #ddd7cc;padding-left:20px;margin:0 0 32px;">
              Al-Ghazālī defines good character as "a firmly established condition of the soul, from which actions proceed easily, without thinking."
              What condition is your soul currently establishing — through the choices you make when no one is watching?
            </p>

            <!-- sign off -->
            <p style="font-size:15px;line-height:1.75;color:#4a4640;margin:0 0 8px;">
              The first letter arrives next week.
            </p>
            <p style="font-size:15px;line-height:1.75;color:#1a1814;margin:0 0 40px;">
              — Sha<br>
              <span style="font-size:12px;color:#8a857d;">ThirtyThree</span>
            </p>

            <!-- footer -->
            <hr style="border:none;border-top:1px solid #ddd7cc;margin:0 0 20px;">
            <p style="font-size:11px;color:#b0a390;line-height:1.6;margin:0;">
              You subscribed at thirtythree.shafiranoh.com ·
              <a href="{{unsubscribe}}" style="color:#b0a390;">Unsubscribe</a>
            </p>

          </div>
        </body>
        </html>`;
    }
    else if (isReflection) {
        fromEmail = sender_email || "hai@shafiranoh.com";
        fromName = "Reflective Industrious";
        finalSubject = email_subject || "Seat Confirmed: Qawwam & Techbros";
        
        emailHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5F5F7; margin: 0; padding: 40px 20px; color: #1C1917;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <div style="background-color: #1C1917; padding: 40px; text-align: center; border-top: 6px solid #D93025;">
                    <p style="color: #D93025; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">Seat Confirmed</p>
                    <h1 style="color: #ffffff; font-size: 26px; font-family: Georgia, serif; font-weight: normal; margin: 0;">Qawwam in the Age of Techbros</h1>
                </div>
                <div style="padding: 40px;">
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hello ${user_name},</p>
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">You are officially registered for our upcoming Reflection Series conversation. Thank you for making space for this critical discussion.</p>
                    <div style="background-color: #FAFAF9; border: 1px solid #E5E5E5; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding-bottom: 15px; border-bottom: 1px solid #E5E5E5;">
                                    <div style="font-size: 12px; color: #86868B; text-transform: uppercase;">Date & Time</div>
                                    <div style="font-size: 16px; font-weight: 500; color: #1C1917; margin-top: 4px;">Sunday, 10th May 2026<br><span style="color: #D93025; font-size: 14px;">(Time TBA)</span></div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-top: 15px;">
                                    <div style="font-size: 12px; color: #86868B; text-transform: uppercase;">Location</div>
                                    <div style="font-size: 16px; font-weight: 500; color: #1C1917; margin-top: 4px;">BiblioPress, Petaling Jaya</div>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; font-weight: bold;">Your First Takeaway Kit: Unlocked 🔓</p>
                    <p style="font-size: 15px; line-height: 1.6; color: #57534E; margin-bottom: 25px;">As promised, here is the <strong>Safety Imbalance Diagnostic</strong> tool. We invite you to reflect on this before the event.</p>
                    <div style="border: 1px solid #E7E5E4; border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
                        <div style="background-color: #1C1917; color: white; padding: 15px 20px;">
                            <h3 style="margin: 0; font-size: 16px;">Tool 1: The Safety Imbalance Diagnostic</h3>
                        </div>
                        <div style="padding: 20px; background-color: #FAFAF9;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                                <thead>
                                    <tr>
                                        <th style="padding: 10px; border-bottom: 2px solid #E7E5E4; width: 70%;">Do you do this regularly?</th>
                                        <th style="padding: 10px; border-bottom: 2px solid #E7E5E4; text-align: center;">Men</th>
                                        <th style="padding: 10px; border-bottom: 2px solid #E7E5E4; text-align: center;">Women</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td style="padding: 10px; border-bottom: 1px solid #E7E5E4;">Check who's walking behind you at night</td><td style="padding: 10px; border-bottom: 1px solid #E7E5E4; text-align: center;">☐</td><td style="padding: 10px; border-bottom: 1px solid #E7E5E4; text-align: center;">☑</td></tr>
                                    <tr><td style="padding: 10px; border-bottom: 1px solid #E7E5E4;">Share your location when traveling alone</td><td style="padding: 10px; border-bottom: 1px solid #E7E5E4; text-align: center;">☐</td><td style="padding: 10px; border-bottom: 1px solid #E7E5E4; text-align: center;">☑</td></tr>
                                    <tr><td style="padding: 10px; border-bottom: 1px solid #E7E5E4;">Avoid certain routes due to harassment risk</td><td style="padding: 10px; border-bottom: 1px solid #E7E5E4; text-align: center;">☐</td><td style="padding: 10px; border-bottom: 1px solid #E7E5E4; text-align: center;">☑</td></tr>
                                    <tr><td style="padding: 10px; border-bottom: 1px solid #E7E5E4;">Mentally rehearse escape routes in new spaces</td><td style="padding: 10px; border-bottom: 1px solid #E7E5E4; text-align: center;">☐</td><td style="padding: 10px; border-bottom: 1px solid #E7E5E4; text-align: center;">☑</td></tr>
                                </tbody>
                            </table>
                            <div style="margin-top: 20px; background-color: #FEF2F2; padding: 15px; border-radius: 8px; border-left: 3px solid #D93025;">
                                <p style="margin: 0 0 10px 0; font-size: 13px; color: #991B1B;"><strong>For men:</strong> Count how many you checked. This is not universal safety consciousness — this is gendered threat calculation.</p>
                                <p style="margin: 0; font-size: 13px; color: #991B1B;"><strong>For women:</strong> This is not paranoia. This is adaptive risk management in an imbalanced system.</p>
                            </div>
                        </div>
                    </div>
                    <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #E2E8F0;">
                        <p style="font-size: 14px; margin: 0; color: #475569;">📚 <strong>Note:</strong> A curated reading list will be sent to you <strong>1-2 days before the event</strong>.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
    }
    else if (isDeeptech && items_purchased.includes("Lead Magnet")) {
        fromEmail = sender_email || "razlan.hamdan@aphelia.space";
        fromName = "Deeptech Initiative";
        finalSubject = email_subject || "Your Deeptech Grant Readiness Checklist";
        emailHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #F5F5F7; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; border-top: 4px solid #D93025;">
            <h2 style="color: #1C1917; margin-top: 0;">Your Deeptech Grant Readiness Checklist</h2>
            <p>Hi there,</p>
            <p>Thanks for requesting the checklist. We know the "Valley of Death" is real, and our mission at <strong>Deeptech Initiative</strong> is to bridge the gap between scientific innovation and commercial reality.</p>
            <div style="background: #FFFDF7; padding: 20px; border-radius: 8px; border: 1px solid #E7E5E4; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #D93025; font-size: 16px;">The 5 Knock-Out Criteria</h3>
                <ul style="padding-left: 20px; color: #444;">
                <li><strong>Corporate Structure:</strong> Sdn Bhd required.</li>
                <li><strong>Equity:</strong> >51% Malaysian owned.</li>
                <li><strong>Capital:</strong> >RM 10,000 paid-up.</li>
                <li><strong>IP Status:</strong> Owned or Licensed.</li>
                <li><strong>TRL Match:</strong> Aligned with fund scope.</li>
                </ul>
            </div>
            <p style="font-size: 0.9em; color: #666;"><strong>Questions?</strong><br>Contact: <a href="mailto:razlan.hamdan@aphelia.space" style="color: #D93025;">razlan.hamdan@aphelia.space</a></p>
            </div>
        </body>
        </html>`; 
    }
    else if (isDeeptech) {
        fromEmail = sender_email || "razlan.hamdan@aphelia.space";
        fromName = "Deeptech Initiative";
        finalSubject = email_subject || "Receipt Received: Deeptech Initiative";
        emailHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; background-color: #F5F5F7; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 40px;">
            <h2 style="color: #D93025; margin-top: 0;">${finalSubject}</h2>
            <p><strong>Name:</strong> ${user_name}</p>
            <p><strong>Item:</strong> ${items_purchased}</p>
            <p><strong>Amount:</strong> ${displayAmount}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">Deeptech Initiative | Aphelia Space</p>
            </div>
        </body>
        </html>`;
    }
    else if (isBarter) { 
        fromEmail = sender_email || "hai@shafiranoh.com";
        fromName = "Barter.today";
        finalSubject = email_subject || "Welcome to the Barter Revolution";
        emailHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: 'Merriweather', serif; background-color: #FDFCF8; padding: 40px 20px; color: #3D405B;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(61, 64, 91, 0.05); border-top: 4px solid #E07A5F;">
            <h2 style="color: #3D405B; margin-top: 0; font-family: 'Merriweather', serif; font-size: 28px; line-height: 1.3;">You're in. Welcome.</h2>
            <p style="font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.7; color: #3D405B;">${user_name},</p>
            <p style="font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.7; color: #3D405B;">Thank you for trusting this idea before it's even built. That takes something.</p>
            <p style="font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.7; color: #3D405B; margin-top: 40px;">With intention,<br><span style="color: #E07A5F; font-weight: 500;">Shafira</span><br><span style="font-size: 14px; color: #81B29A;">Founder, Barter.today</span></p>
            </div>
        </body>
        </html>`;
    }
    else {
        fromEmail = sender_email || "hai@shafiranoh.com";
        fromName = "Cetalabs Finance";
        finalSubject = email_subject || "Payment Receipt: Cetalabs";
        emailHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: 'Inter', sans-serif; background-color: #F9FAFB; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #0F766E; margin-top: 0;">Payment Receipt</h2>
            <p>Dear ${user_name},</p>
            <p>Thank you for your payment. We are excited to start this project with you.</p>
            <div style="background-color: #F0FDFA; padding: 20px; border-radius: 8px; border: 1px solid #CCFBF1; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Service:</strong> ${items_purchased}</p>
                <p style="margin: 5px 0;"><strong>Total Paid:</strong> ${displayAmount}</p>
                <p style="margin: 5px 0; color: #059669; font-weight: bold;">Status: PAID</p>
            </div>
            </div>
        </body>
        </html>`;
    }

    const brevoBody = {
        sender: { name: fromName, email: fromEmail },
        to: [{ email: user_email, name: user_name }],
        bcc: [{ email: adminDest, name: "Admin Notification" }], 
        subject: finalSubject,
        htmlContent: emailHtml
    };

    if (file_name && file_content) {
        brevoBody.attachment = [{ name: file_name, content: file_content }];
    }

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "api-key": env.BREVO_API_KEY,
            "content-type": "application/json"
        },
        body: JSON.stringify(brevoBody)
    });

    const responseData = await brevoResponse.json();

    if (!brevoResponse.ok) {
        throw new Error(JSON.stringify(responseData));
    }

    return responseData;
}

export default {
    async fetch(request, env, ctx) {
        // --- CONFIGURATION ---
        const USE_TEST_MODE = false; // Set to false when ready for live payments
        // ---------------------

        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
            "Access-Control-Allow-Headers": "Content-Type, x-signature",
        };

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        if (request.method === "GET") {
            return new Response(JSON.stringify({ isTestMode: USE_TEST_MODE }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (request.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
        }

        try {
            // ---------------------------------------------------------
            // ACTION 0: WEBHOOK LISTENER (Triggered automatically by Chip-in)
            // ---------------------------------------------------------
            const signature = request.headers.get("x-signature");
            
            if (signature) {
                // It's a webhook request from Chip!
                const rawBodyBuffer = await request.arrayBuffer();
                const isValid = await verifyChipSignature(signature, rawBodyBuffer);
                
                if (!isValid) {
                    console.error("Webhook signature verification failed.");
                    return new Response("Invalid Signature", { status: 401 });
                }

                const bodyText = new TextDecoder().decode(rawBodyBuffer);
                const event = JSON.parse(bodyText);

                // If the purchase was successful, dispatch the email
                if (event.status === 'paid' || event.event_type === 'purchase.paid') {
                    
                    // Reconstruct payload for email dispatcher based on Chip data
                    const webhookEmailPayload = {
                        user_name: event.client?.full_name || 'Customer',
                        user_email: event.client?.email,
                        total_amount: `RM ${(event.purchase?.total / 100).toFixed(2)}`,
                        items_purchased: event.purchase?.products?.map(p => p.name).join(' + ') || 'Reflection Series',
                        // Optional fallback if you want to explicitly declare sender
                        sender_email: "hai@shafiranoh.com" 
                    };

                    await sendBrevoEmailInternal(webhookEmailPayload, env);
                    console.log(`Webhook processed and email sent to ${webhookEmailPayload.user_email}`);
                }

                return new Response("Webhook Received", { status: 200 });
            }

            // ---------------------------------------------------------
            // NORMAL FRONTEND ACTIONS
            // ---------------------------------------------------------
            const payload = await request.json();
            const action = payload.action;

            // ACTION 1: CREATE PAYMENT (CHIP-IN ASIA)
            if (action === 'create_payment') {
                const clientIp = request.headers.get("CF-Connecting-IP");
                if (clientIp) payload.client_ip = clientIp;

                const secretKey = USE_TEST_MODE ? env.CHIP_SECRET_KEY_TEST : env.CHIP_SECRET_KEY;

                if (!secretKey) {
                    return new Response(JSON.stringify({ error: `Secret key for ${USE_TEST_MODE ? 'test' : 'live'} mode not configured in Cloudflare` }), { status: 500, headers: corsHeaders });
                }

                const chipPayload = { ...payload };
                delete chipPayload.action;
                if (chipPayload.mode) delete chipPayload.mode; 

                if (env.CHIP_BRAND_ID) {
                    chipPayload.brand_id = env.CHIP_BRAND_ID;
                }

                const chipResponse = await fetch("https://gate.chip-in.asia/api/v1/purchases/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + secretKey
                    },
                    body: JSON.stringify(chipPayload)
                });

                const data = await chipResponse.json();
                return new Response(JSON.stringify(data), { status: chipResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
            }

            // ACTION 2: SEND EMAIL (BREVO - Manual Upload / Lead Magnet)
            else if (action === 'send_email') {
                const responseData = await sendBrevoEmailInternal(payload, env);
                return new Response(JSON.stringify({ message: "Email sent", id: responseData.messageId }), { status: 200, headers: corsHeaders });
            }

            // ACTION 3: SUBSCRIBE TO NEWSLETTER (BREVO - list picked per project)
            else if (action === 'subscribe_newsletter') {
                if (!env.BREVO_API_KEY) {
                    throw new Error("Brevo API key is not configured.");
                }

                // payload.list selects which Brevo list to join; defaults to Irori's
                // for callers that don't pass it, so existing integrations keep working.
                const targetListEnvKey = payload.list === 'thirtythree' ? 'BREVO_TT_LIST_ID' : 'BREVO_LIST_ID';
                const targetListId = env[targetListEnvKey];
                if (!targetListId) {
                    throw new Error(`${targetListEnvKey} is not configured in Cloudflare environment variables.`);
                }

                const brevoContact = await fetch("https://api.brevo.com/v3/contacts", {
                    method: "POST",
                    headers: {
                        "accept": "application/json",
                        "api-key": env.BREVO_API_KEY,
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({
                        email: payload.user_email,
                        attributes: { FIRSTNAME: payload.user_name },
                        listIds: [parseInt(targetListId)],
                        updateEnabled: true
                    })
                });

                if (!brevoContact.ok && brevoContact.status !== 204) {
                    const errData = await brevoContact.json();
                    throw new Error(JSON.stringify(errData));
                }

                return new Response(JSON.stringify({ message: "Subscribed" }), { status: 200, headers: corsHeaders });
            }

            return new Response("Invalid Action", { status: 400, headers: corsHeaders });

        } catch (error) {
            console.error("Worker Execution Error:", error.message);
            return new Response(JSON.stringify({ message: "Worker Execution Error", error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
    },
};