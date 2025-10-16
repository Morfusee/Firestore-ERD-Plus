export const accountDeletedEmail = (username: string) => {
  const date = new Date().toLocaleDateString();

  return `
    <p>Dear ${username},</p>
    <p>We are confirming that your request to delete your account has been successfully processed.</p>
    
    <p>All associated data, including your profile picture and login credentials, have been permanently removed from our system as of ${date}.</p>
        
    <p>Thank you for using FirestoreERD.</p>
    
    <p>Sincerely,<br>The FirestoreERD Team</p>
  `;
};
