import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmailRequest {
  email: string;
  authorName: string;
  bookTitle: string;
  dashboardUrl: string;
  publicUrl: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const { email, authorName, bookTitle, dashboardUrl, publicUrl }: EmailRequest = await req.json();

    // In a production environment, you would integrate with an email service like:
    // - Resend
    // - SendGrid
    // - Mailgun
    // - AWS SES

    // For now, we'll just log the email that would be sent
    // and return success so the app continues to work

    const emailContent = {
      to: email,
      subject: `Your Review Funnel is Live: ${bookTitle}`,
      body: `Hi ${authorName},

Your review funnel for "${bookTitle}" has been created successfully!

📊 Dashboard (bookmark this!): ${dashboardUrl}
🔗 Share this link with readers: ${publicUrl}

Important: Save this email! Your dashboard link allows you to:
- View all submitted reviews
- Track reader engagement
- See conversion metrics
- Monitor Amazon link clicks

Need to access your funnels later? Visit ${new URL(dashboardUrl).origin}/my-funnels and log in with this email.

Best regards,
Review Assistant Team`
    };

    console.log('Email would be sent:', emailContent);

    // TODO: Replace with actual email service integration
    // Example with Resend:
    // const res = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     from: 'Review Assistant <noreply@yourdomain.com>',
    //     to: email,
    //     subject: emailContent.subject,
    //     text: emailContent.body
    //   })
    // });

    return new Response(
      JSON.stringify({success: true}),
        //message: 'Email notification prepared (integration pending)',
        //emailPreview: emailContent
      //}),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status:200,
      }
    );
  } catch (err) {
    //console.error('Error in send-dashboard-email:', error);

    return new Response(
      JSON.stringify({error: err.message,}),
      {
        //status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status:500,
      }
    );
  }
});
