import emailjs from '@emailjs/browser';
import equalityChecker from './passwordFunctions';

emailjs.init({
  publicKey: 'svLOPoU7SKKJ48aES',
  blockHeadless: true,
  limitRate: {
    id: 'app',
    throttle: 15000,
  },
});

const service_id = 'service_827imk7';
const template_id = 'template_x7es1ms';

let code = '';

// Email validation function
const isValidEmail = (email: string): boolean => {
    // RFC 5322 standard email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

const codeGenerator = async () => {
    code = Math.floor(10000 + Math.random() * 90000).toString();;
}

const emailSend = async (email: string) => {
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return false;
    }

    await codeGenerator();
    try {
        const response = 
        await emailjs.send(
            service_id,
            template_id,
            {
                to_email: email,
                message: code,
            }
        );

        if (response.status === 200) {
            alert(`Reset Code Sent To ${email}`);
            return true;
        }
    } catch(error) {
        alert('Failed To Send Verification Code. Please Try Again.');
        return false;
    }
}

const verifiyCode = (resetCode: string) => {
    return equalityChecker(resetCode, code);
}

export { emailSend, verifiyCode, isValidEmail };
