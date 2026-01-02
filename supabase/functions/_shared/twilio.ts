const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!;
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!;

const TWILIO_API_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}`;

interface TwilioMessageResponse {
  sid: string;
  status: string;
  error_code?: number;
  error_message?: string;
}

interface TwilioPhoneNumber {
  sid: string;
  phone_number: string;
  friendly_name: string;
  capabilities: {
    sms: boolean;
    mms: boolean;
    voice: boolean;
  };
}

export async function sendSMS(
  to: string,
  from: string,
  body: string,
  statusCallback?: string
): Promise<{ success: boolean; data?: TwilioMessageResponse; error?: string }> {
  try {
    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', from);
    params.append('Body', body);
    
    if (statusCallback) {
      params.append('StatusCallback', statusCallback);
    }

    const response = await fetch(`${TWILIO_API_URL}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Twilio error: ${response.status}`,
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getAvailablePhoneNumbers(
  areaCode?: string,
  country: string = 'US'
): Promise<{ success: boolean; data?: TwilioPhoneNumber[]; error?: string }> {
  try {
    let url = `${TWILIO_API_URL}/AvailablePhoneNumbers/${country}/Local.json?SmsEnabled=true`;
    
    if (areaCode) {
      url += `&AreaCode=${areaCode}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Twilio error: ${response.status}`,
      };
    }

    return {
      success: true,
      data: data.available_phone_numbers?.map((p: any) => ({
        sid: '',
        phone_number: p.phone_number,
        friendly_name: p.friendly_name,
        capabilities: p.capabilities,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function purchasePhoneNumber(
  phoneNumber: string,
  smsWebhookUrl?: string,
  voiceWebhookUrl?: string
): Promise<{ success: boolean; data?: TwilioPhoneNumber; error?: string }> {
  try {
    const params = new URLSearchParams();
    params.append('PhoneNumber', phoneNumber);
    
    if (smsWebhookUrl) {
      params.append('SmsUrl', smsWebhookUrl);
      params.append('SmsMethod', 'POST');
    }
    
    if (voiceWebhookUrl) {
      params.append('VoiceUrl', voiceWebhookUrl);
      params.append('VoiceMethod', 'POST');
    }

    const response = await fetch(`${TWILIO_API_URL}/IncomingPhoneNumbers.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Twilio error: ${response.status}`,
      };
    }

    return {
      success: true,
      data: {
        sid: data.sid,
        phone_number: data.phone_number,
        friendly_name: data.friendly_name,
        capabilities: data.capabilities,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function releasePhoneNumber(
  phoneSid: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${TWILIO_API_URL}/IncomingPhoneNumbers/${phoneSid}.json`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const data = await response.json();
      return {
        success: false,
        error: data.message || `Twilio error: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function updatePhoneNumberWebhooks(
  phoneSid: string,
  smsWebhookUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const params = new URLSearchParams();
    params.append('SmsUrl', smsWebhookUrl);
    params.append('SmsMethod', 'POST');

    const response = await fetch(`${TWILIO_API_URL}/IncomingPhoneNumbers/${phoneSid}.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        error: data.message || `Twilio error: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
