// Quiz_Management App Script
function runDailyQuizAutomation() {
    Logger.log("Starting daily quiz automation...");
  
    //updateDailyQuiz(); // Step 1: Update Quiz and Send Link
    Utilities.sleep(2000); // Short delay for stability
  
    recordQuizResults(); // Step 2: Record Results
    Utilities.sleep(2000);
  
    sendDailyResults(); // Step 3: Send Scores
    Utilities.sleep(2000);
  
    markAbsentParticipants(); // Step 4: Notify Absentees
  
    Logger.log("Daily quiz automation completed.");
  }
  
  function updateDailyQuiz() {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var quizSheet = ss.getSheetByName("Daily_Quizzes");
      var historySheet = ss.getSheetByName("Quiz_History");
      var regSheet = ss.getSheetByName("Quiz_Registrations");
      var form = FormApp.openById("1drI5NTZmzT7JkSS7E3ZuS54QQu2b-URm_AjQJOQf80c"); 
  
      if (!quizSheet || !historySheet || !regSheet || !form) {
        Logger.log("Error: One or more sheets/forms are missing.");
        return;
      }
  
      var data = quizSheet.getDataRange().getValues();
      if (data.length < 2) return;
  
      var today = new Date().toISOString().split("T")[0];
      var historyRow = [today];
  
      for (var i = 1; i <= 10; i++) {
        var questionRow = data[i];
        if (questionRow.length < 6) continue;
  
        historyRow.push(questionRow[0]);  // Question
        historyRow.push(questionRow[5]);  // Correct Answer
      }
      historySheet.appendRow(historyRow);
  
      form.getItems().forEach(item => form.deleteItem(item));
  
      for (var i = 1; i <= 10; i++) {
        var questionRow = data[i];  
        if (questionRow.length < 6) continue;
  
        var item = form.addMultipleChoiceItem();
        var choices = [
          item.createChoice(questionRow[1]),
          item.createChoice(questionRow[2]),
          item.createChoice(questionRow[3]),
          item.createChoice(questionRow[4])
        ];
  
        item.setTitle(questionRow[0]).setChoices(choices);
      }
  
      sendQuizNotification(regSheet, form.getPublishedUrl());
  
    } catch (e) {
      Logger.log("Error in updateDailyQuiz: " + e.toString());
    }
  }
  
  function recordQuizResults() {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var form = FormApp.openById("1drI5NTZmzT7JkSS7E3ZuS54QQu2b-URm_AjQJOQf80c");
      var responseSheet = ss.getSheetByName("Quiz_Results");
      var historySheet = ss.getSheetByName("Quiz_History");
  
      if (!responseSheet || !historySheet) {
        Logger.log("Error: Sheets not found.");
        return;
      }
  
      var responses = form.getResponses();
      if (responses.length === 0) return;
  
      var historyData = historySheet.getDataRange().getValues();
      var today = new Date().toISOString().split("T")[0];
      var historyRow = historyData.find(row => row[0] === today);
      
      if (!historyRow) {
        Logger.log("No quiz history for today.");
        return;
      }
  
      var lastRow = responseSheet.getLastRow();
      var existingEmails = responseSheet.getRange(2, 3, lastRow, 1).getValues().flat();
  
      responses.forEach(response => {
        var email = response.getRespondentEmail();
        if (existingEmails.includes(email)) return;
  
        var itemResponses = response.getItemResponses();
        var selectedAnswers = [];
        var correctAnswers = [];
        var correctCount = 0;
  
        for (var i = 0; i < 10; i++) {
          var selectedAnswer = itemResponses[i] ? itemResponses[i].getResponse() : "N/A";
          var correctAnswer = historyRow[i * 2 + 2] || "N/A";
  
          selectedAnswers.push(selectedAnswer);
          correctAnswers.push(correctAnswer);
  
          if (selectedAnswer === correctAnswer) correctCount++;
        }
  
        var score = (correctCount / 10) * 100;
        var status = score >= 50 ? "Passed" : "Failed";
  
        responseSheet.appendRow([today, "", email, selectedAnswers.join(", "), correctAnswers.join(", "), correctCount, 10 - correctCount, score, status]);
      });
  
    } catch (e) {
      Logger.log("Error in recordQuizResults: " + e.toString());
    }
  }
  
  function sendDailyResults() {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var resultsSheet = ss.getSheetByName("Quiz_Results");
  
      if (!resultsSheet) {
        Logger.log("Error: Results sheet missing.");
        return;
      }
  
      var lastRow = resultsSheet.getLastRow();
      if (lastRow < 2) return;
  
      var data = resultsSheet.getRange(2, 1, lastRow - 1, 9).getValues();
      
      data.forEach(row => {
        var email = row[2];
        var score = row[7];
        var status = row[8];
  
        var subject = "Your Daily Quiz Results";
        var message = `Hello,\n\nYour quiz results:\nScore: ${score}%\nStatus: ${status}\n\nThanks for participating!`;
  
        try {
          MailApp.sendEmail(email, subject, message);
          Logger.log("Email sent to: " + email);
        } catch (err) {
          Logger.log("Error sending email to " + email + ": " + err.toString());
        }
      });
  
    } catch (e) {
      Logger.log("Error in sendDailyResults: " + e.toString());
    }
  }
  
  function markAbsentParticipants() {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var regSheet = ss.getSheetByName("Quiz_Registrations");
      var resultsSheet = ss.getSheetByName("Quiz_Results");
  
      if (!regSheet || !resultsSheet) {
        Logger.log("Error: Sheets missing.");
        return;
      }
  
      var today = new Date().toISOString().split("T")[0];
      var submittedEmails = resultsSheet.getRange(2, 3, resultsSheet.getLastRow(), 1).getValues().flat();
      var regData = regSheet.getDataRange().getValues();
      
      regData.shift();
  
      regData.forEach(row => {
        var name = row[0];
        var email = row[1];
  
        if (email && !submittedEmails.includes(email)) {
          try {
            MailApp.sendEmail(email, "Missed Quiz Notification", `Hello ${name},\n\nYou did not submit today's quiz. Please participate in future quizzes.\n\nBest Regards!`);
            Logger.log("Absent email sent to: " + email);
          } catch (err) {
            Logger.log("Error sending absent email: " + err.toString());
          }
        }
      });
  
    } catch (e) {
      Logger.log("Error in markAbsentParticipants: " + e.toString());
    }
  }
  
  function sendQuizNotification(regSheet, quizLink) {
    try {
      var data = regSheet.getDataRange().getValues();
      if (data.length < 2) return; // No registrations
  
      for (var i = 1; i < data.length; i++) {
        var name = data[i][0]; // Assuming Name is in Column A
        var email = data[i][1]; // Assuming Email is in Column B
  
        if (email) {
          var subject = "Today's Quiz is Ready!";
          var message = `Hello ${name},\n\nYour daily quiz is now available! Click the link below to participate:\n\n${quizLink}\n\nPlease complete it before the deadline.\n\nBest of luck!`;
  
          try {
            MailApp.sendEmail(email, subject, message);
            Logger.log(`Quiz link sent to: ${email}`);
          } catch (err) {
            Logger.log(`Error sending quiz link to ${email}: ${err.toString()}`);
          }
        }
      }
    } catch (e) {
      Logger.log("Error in sendQuizNotification: " + e.toString());
    }
  }