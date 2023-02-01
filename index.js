import fs from 'fs';
import csvParser from 'csv-parser';
import sgMail from '@sendgrid/mail';
import inquirer from 'inquirer';

sgMail.setApiKey('...');

async function sendEmail(email, balance) {
  const msg = {
    to: email,
    from: '...',
    subject: 'Your Outstanding Balance',
    text: `Dear Patient, Your current outstanding balance is $${balance}. Please make a payment as soon as possible.`,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
  }
}

function main() {
  inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'sendEmails',
        message:
          'Do you want to send an email to all patients with their outstanding balance?',
        default: false,
      },
    ])
    .then(async (answers) => {
      if (!answers.sendEmails) {
        console.log('Aborted');
        return;
      }

      fs.createReadStream('test.csv')
        .pipe(csvParser())
        .on('data', async (data) => {
          const email = data['patient.emailaddress'];
          const balance = data['patient.balance'];

          await sendEmail(email, balance);
        })
        .on('end', () => {
          console.log('All emails sent');
        });
    });
}

main();
