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
    // await sgMail.send(msg);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
  }
}

function main() {
  // ask the user if they want to send an email to all patients
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

      // read the CSV file and send an email to each patient with their balance
      fs.createReadStream('test.csv')
        .pipe(csvParser())
        .on('data', async (data) => {
          const email = data['patient.emailaddress'];
          const balance = data.balance;

          await sendEmail(email, balance);
        })
        .on('end', () => {
          console.log('All emails sent');
        });
    });
}

main();
