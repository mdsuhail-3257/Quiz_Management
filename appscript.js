// ✅ Constants (Replace with actual IDs)
const SHEET_ID = "Google_Sheet_ID";  
const FORM_ID = "Google_Form_ID";  
const REGISTRATION_SHEET = "Quiz_Registration";  
const QUIZZES_SHEET = "Daily_Quizzes"; //Update this sheet with new questions daily 
const RESPONSE_SHEET = "Quiz_Response"; //Append responses from Google Form here  
const HISTORY_SHEET = "Quiz_History";  //Store daily quizzes here
const RESULT_SHEET = "Quiz_Result"; //

//Columns to add in Google Sheets
// Quiz_Registration: Name, Email,Status
// Daily_Quizzes: Question,Options A,Options B,Options C,Options D, Answer
// Quiz_Response: Date, Email, Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Score, Status
// Quiz_History: Date, Q1, Answer1, Q2, Answer2, Q3, Answer3, Q4, Answer4, Q5, Answer5, Q6, Answer6, Q7, Answer7, Q8, Answer8, Q9, Answer9, Q10, Answer10
// Quiz_Result: Date, Email, Name, Score, Status

// ✅ Main Function  //****create separate script for this *****/
function runDailyQuizAutomation() {
    updateQuizForm();       // Step 1: Update Form with New Questions
    sendQuizToUsers();      // Step 2: Send Quiz Link to Registered Users
    moveFormResponses();    // Step 3: Sync Responses to Quiz_Response Tab
    storeQuizHistory();     // Step 4: Store the Quiz and Answers in Quiz_History
    processQuizResults();   // Step 5: Process Results and Email Users and Notify Non-Attempting Users
}
// ****** Set All Triggers ******
function setAllTriggers() {
    ScriptApp.newTrigger("updateQuizForm").timeBased().atHour(4).everyDays(1).create();
    ScriptApp.newTrigger("sendQuizToUsers").timeBased().atHour(5).everyDays(1).create();
    ScriptApp.newTrigger("moveFormResponses").timeBased().everyMinutes(5).create();
    ScriptApp.newTrigger("storeQuizHistory").timeBased().atHour(23).everyDays(1).create();
    ScriptApp.newTrigger("processQuizResults").timeBased().atHour(23).everyDays(1).create();
    ScriptApp.newTrigger("notifyUsers").timeBased().atHour(23).everyDays(1).create();
    
    Logger.log("✅ All triggers set successfully.");
}
// ***** For testing *****
// function testprocessQuizResults() {
//   processQuizResults();
// }

// ✅ Step 1: Update Google Form with New Questions
function updateQuizForm() {
    try {
        const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(QUIZZES_SHEET);
        const form = FormApp.openById(FORM_ID);

        // Delete all existing questions in the form
        form.getItems().forEach(item => form.deleteItem(item));

        const questions = sheet.getRange(2, 1, 10, 6).getValues(); // Fetch 10 questions

        questions.forEach((row, index) => {
            let question = row[0]; // Question Text
            let options = row.slice(1, 5); // Options (A, B, C, D)

            let mcqItem = form.addMultipleChoiceItem();
            let choices = options.map(option => mcqItem.createChoice(option)); // ✅ Correct way to create choices

            mcqItem.setTitle(`Q${index + 1}: ${question}`)
                .setChoices(choices)
                .showOtherOption(false);
        });

        Logger.log("✅ Quiz Form Updated Successfully.");
    } catch (error) {
        handleError(error, "updateQuizForm");
    }
}




// ✅ Step 2: Send Quiz Form Link to Registered Users
function sendQuizToUsers() {
    try {
        const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(REGISTRATION_SHEET);
        const emails = sheet.getRange(2, 2, sheet.getLastRow() - 1).getValues().flat();
        const formUrl = FormApp.openById(FORM_ID).getPublishedUrl();

        emails.forEach(email => {
            MailApp.sendEmail(email, "📢 Today's Quiz is Live!", `Attempt the quiz here: ${formUrl}\nDeadline: 11:30 PM`);
        });

        Logger.log("✅ Quiz link sent to all registered users.");
    } catch (error) {
        handleError(error, "sendQuizToUsers");
    }
}

// ✅ Step 3: Move Responses from Google Form to Quiz_Response Tab
function moveFormResponses() {
    try {
        const ss = SpreadsheetApp.openById(SHEET_ID);
        const formSheet = ss.getSheetByName("Form Responses 1");
        const regSheet = ss.getSheetByName("Quiz_Registration");
        const quizSheet = ss.getSheetByName("Daily_Quizzes");
        const responseSheet = ss.getSheetByName("Quiz_Response");

        const today = new Date().toISOString().split('T')[0];

        // ✅ Fetch registered emails from Quiz_Registration (Column B)
        const regEmails = regSheet.getRange(2, 2, regSheet.getLastRow() - 1, 1).getValues().flat();

        // ✅ Fetch responses from "Form Responses 1"
        const responses = formSheet.getRange(2, 1, formSheet.getLastRow() - 1, formSheet.getLastColumn()).getValues();

        // ✅ Fetch correct answers from "Daily_Quizzes" (Column F)
        const correctAnswers = quizSheet.getRange(2, 6, 10, 1).getValues().flat().map(ans => ans.toString().trim()); 

        let newResponses = [];
        let respondedEmails = new Set();

        responses.forEach(row => {
            let email = row[1].trim(); // Email in Column B of Form Responses 1
            if (!regEmails.includes(email)) {
                Logger.log(`❌ Invalid Response - Email not registered: ${email}`);
                return;
            }
            respondedEmails.add(email);

            // ✅ Extract user answers from columns **D to M** (10 Questions)
            let userAnswers = row.slice(3, 13).map(ans => ans.toString().trim()); 

            // ✅ Calculate Score (compare user answers with correct answers)
            let score = userAnswers.reduce((total, ans, i) => total + (ans === correctAnswers[i] ? 1 : 0), 0);

            newResponses.push([today, email, ...userAnswers, score, "Present"]);
        });

        // ✅ Mark Absent Users (Users in `Quiz_Registration` who didn't submit responses)
        regEmails.forEach(email => {
            if (!respondedEmails.has(email)) {
                newResponses.push([today, email, "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", 0, "Absent"]);
            }
        });

        // ✅ Append Data to Quiz_Response
        if (newResponses.length > 0) {
            responseSheet.getRange(responseSheet.getLastRow() + 1, 1, newResponses.length, newResponses[0].length).setValues(newResponses);
            Logger.log("✅ Responses moved, scores calculated, and absentees marked.");
        } else {
            Logger.log("⚠️ No valid responses found.");
        }
    } catch (error) {
        Logger.log(`❌ Error in moveFormResponses: ${error.message}`);
    }
}









// ✅ Step 4: Store Daily Quiz in Quiz_History
function storeQuizHistory() {
    try {
        const sheet = SpreadsheetApp.openById(SHEET_ID);
        const quizSheet = sheet.getSheetByName(QUIZZES_SHEET);
        const historySheet = sheet.getSheetByName(HISTORY_SHEET);

        const data = quizSheet.getRange(2, 1, 10, 6).getValues();
        const date = new Date();
        const formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");

        const historyRow = [formattedDate];
        data.forEach(row => historyRow.push(row[0], row[5])); // Store Question + Answer Only

        historySheet.appendRow(historyRow);
        Logger.log("✅ Quiz history updated.");
    } catch (error) {
        handleError(error, "storeQuizHistory");
    }
}

// ✅ Step 5: Process Quiz Results
function processQuizResults() {
    try {
        const sheet = SpreadsheetApp.openById(SHEET_ID);
        const responseSheet = sheet.getSheetByName("Quiz_Response");
        const resultSheet = sheet.getSheetByName("Quiz_Result");
        const regSheet = sheet.getSheetByName("Quiz_Registration");

        const today = new Date().toISOString().split('T')[0];

        // ✅ Fetch registered users (Name, Email)
        const registeredUsers = regSheet.getRange(2, 1, regSheet.getLastRow() - 1, 2).getValues();
        const regEmails = registeredUsers.map(row => row[1].trim()); 

        // ✅ Fetch existing responses
        const responses = responseSheet.getDataRange().getValues();
        if (responses.length <= 1) return; // No responses

        let processedEmails = new Set();
        let results = [];

        responses.forEach((row, index) => {
            if (index === 0) return; // Skip header row
            
            let email = row[1].trim(); // Column B: Email
            let score = row[12]; // Column M: Score
            let status = row[13]; // Column N: Present/Absent

            let name = registeredUsers.find(user => user[1].trim() === email)?.[0] || "Unknown";

            // ✅ Append row to Quiz_Result
            results.push([today, email, name, score, status]);
            processedEmails.add(email);

            // ✅ Send score email to attempted students
            if (status === "Present") {
                MailApp.sendEmail({
                    to: email,
                    subject: "Your Quiz Score - " + today,
                    body: `Hello ${name},\n\nYour quiz score for today (${today}) is: ${score}/10.\n\nKeep practicing!\n\nBest regards,\nQuiz Team`
                });
            }
        });

        // ✅ Append results to "Quiz_Result"
        if (results.length > 0) {
            resultSheet.getRange(resultSheet.getLastRow() + 1, 1, results.length, results[0].length).setValues(results);
            Logger.log("✅ Quiz results updated in Quiz_Result.");
        }

        // ✅ Identify and alert absent students
        regEmails.forEach((email, i) => {
            if (!processedEmails.has(email)) {
                let name = registeredUsers[i][0]; // Get Name
                resultSheet.appendRow([today, email, name, 0, "Absent"]);

                // ✅ Send absent alert email
                MailApp.sendEmail({
                    to: email,
                    subject: "Quiz Alert - You Missed Today's Quiz!",
                    body: `Hello ${name},\n\nWe noticed you didn't attempt today's quiz (${today}). Please make sure to participate in the next quiz.\n\nBest regards,\nQuiz Team`
                });

                Logger.log(`⚠️ Absent alert sent to: ${email}`);
            }
        });

    } catch (error) {
        Logger.log(`❌ Error in processQuizResults: ${error.message}`);
    }
}