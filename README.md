# Quiz_Management
Use it for conducting quiz on large Audience


# Ramadan Quiz Automation

## Overview
The **Ramadan Quiz Automation** project is designed to streamline the process of conducting a daily quiz throughout the month of Ramadan. The goal is to help participants, including students, housewives, and working professionals, build a stronger relationship with Allah and the Holy Quran by automating quiz distribution, response collection, result generation, and participant tracking.

## Features
- **Automated Quiz Distribution**: Sends quiz form links to registered participants daily.
- **Response Collection & Evaluation**: Retrieves and evaluates quiz responses.
- **Result Generation & Email Notification**: Calculates scores and emails results to participants.
- **Absentee Tracking**: Marks participants as absent if they fail to submit responses and notifies them.
- **Performance Tracking**: Maintains a record of daily quiz performance for each participant.
- **Merit List Generation**: Compiles a final performance report at the end of the month.

## Project Workflow
### **1. Initial Setup**
- The admin adds participants' names and emails to the **Quiz_Registrations** sheet.
- The daily quiz questions and answers are updated in the **Daily_Quizzes** sheet.
- The Google Form is linked to the quiz for participants to submit responses.

### **2. Daily Quiz Distribution**
- The script extracts quiz questions from the **Daily_Quizzes** sheet.
- Updates the Google Form with the new quiz.
- Sends quiz form links via email to all registered participants.

### **3. Response Collection & Evaluation**
- The script fetches quiz responses submitted via Google Forms.
- Matches selected answers with the correct answers stored in **Quiz_History**.
- Calculates scores and updates the **Quiz_Results** sheet.

### **4. Absentee Marking**
- Compares the list of registered participants with the submitted responses.
- Marks missing participants as absent and sends them a notification email.

### **5. Results Notification**
- Participants receive an email with their quiz scores and status (Passed/Failed).
- Results are stored in the **Quiz_Results** sheet.

### **6. Monthly Merit List Generation**
- Tracks the performance of each participant over the course of one month.
- Generates a merit list based on overall quiz scores.

## Google Sheets Structure
### **1. Quiz_Registrations**
| Name  | Email |
|-------|------|
| Mohammad | member@sio-kurla.com |

### **2. Daily_Quizzes**
| Question | Option A | Option B | Option C | Option D | Correct Answer |
|----------|---------|---------|---------|---------|----------------|
| Sample Question? | A | B | C | D | Correct Answer Text |

### **3. Quiz_History**
| Date | Q1 | A1 | Q2 | A2 | ... |
|------|----|----|----|----|-----|
| 2025-03-10 | Sample Question? | Correct Answer Text | ... |

### **4. Quiz_Results**
| Date | Name | Email | Selected Answers | Correct Answers | Correct Count | Wrong Count | Score | Status |
|------|------|-------|----------------|----------------|--------------|------------|------|--------|
| 2025-03-10 | Mohammad | member@sio-kurla.com | A, C, B... | Correct Answer, ... | 8 | 2 | 80% | Passed |

## How to Run the Script
### **1. Set Up Google Apps Script**
- Open Google Sheets → Extensions → Apps Script.
- Copy the script files into the Apps Script Editor.
- Update the Google Form ID inside the script.
- Deploy necessary triggers:
  - **updateDailyQuiz()** (Runs once a day to send the quiz form link)
  - **recordQuizResults()** (Runs periodically to fetch responses and update results)
  - **sendDailyResults()** (Runs after results are updated to send emails)

### **2. Run Functions Manually (For Debugging)**
- `updateDailyQuiz()` → Sends the quiz form link.
- `recordQuizResults()` → Fetches responses and updates `Quiz_Results`.
- `sendDailyResults()` → Sends results via email.
- `markAbsentParticipants()` → Marks absent users and notifies them.

## Error Handling & Debugging
- **Logging**: Uses `Logger.log()` to capture function execution details.
- **Try-Catch Blocks**: Wrapped around email sending and data processing to catch errors.
- **Manual Debugging**: Run individual functions via Apps Script editor to isolate issues.

## Future Improvements
- **Leaderboard Feature**: Display a leaderboard based on scores.
- **Admin Dashboard**: Create a web-based UI for managing quizzes.
- **Multi-Language Support**: Adapt the quiz for different languages.

## Contributors
- **Mohammad Suhail** – Project Initiator & Developer
- **Open for Contributions** – Feel free to submit pull requests!

## License
This project is open-source and available for collaboration under the MIT License.

---
**For Issues & Debugging:** Submit issues in the GitHub repository to collaborate with other developers.
## 🚨 Known Issues & Bugs

We are actively working on resolving the following issues:
- ✅ **Quiz results not updating automatically**
- ❌ **Emails not sent for absent participants**
- 🛠️ **Need better error handling in App Script**

If you have a fix, feel free to contribute! Check our [Issues](https://github.com/mdsuhail-3257/Quiz_Management/issues).

