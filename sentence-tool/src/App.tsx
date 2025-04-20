import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { HiPencilSquare,  HiHome } from "react-icons/hi2";
import { FaCoins } from "react-icons/fa";
import './components/Homepage.css';
import jsonData from './questionsdata.json';
import { FaDownload } from "react-icons/fa6";
import { MdRestartAlt } from "react-icons/md";
import CircularProgress from './components/CircularProgressBar'; // adjust path if needed


interface Question {
  questionId: string;
  question: string;
  questionType: string;
  answerType: string;
  options: string[];
  correctAnswer: string[];
}

interface Answer {
  questionId: string;
  selected: string[];
}

function App() {
  const questions: Question[] = jsonData.data.questions;
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(30);
  const [selectedOptions, setSelectedOptions] = useState<(string | undefined)[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (started && timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
    if (timer === 0) {
      handleNext();
    }
  }, [timer, started]);

  const startTest = () => {
    const blankCount = (questions[0].question.match(/___________/g) || []).length;
    setStarted(true);
    setCurrentIndex(0);
    setTimer(30);
    setSelectedOptions(new Array(blankCount).fill(undefined));
    setAnswers([]);
    setShowFeedback(false);
  };

  const goHome = () => {
    setStarted(false);
    setShowFeedback(false);
    setCurrentIndex(0);
    setSelectedOptions([]);
    setTimer(30);
    setAnswers([]);
  };

  const handleOptionClick = (option: string) => {
    if (selectedOptions.includes(option)) return;
    const blankCount = (questions[currentIndex].question.match(/___________/g) || []).length;
    const updatedSelection = [...selectedOptions];

    while (updatedSelection.length < blankCount) {
      updatedSelection.push(undefined);
    }

    const emptyIndex = updatedSelection.findIndex((item) => item === undefined);
    if (emptyIndex !== -1) {
      updatedSelection[emptyIndex] = option;
      setSelectedOptions(updatedSelection);
    }
  };

  const handleBlankClick = (index: number) => {
    const updatedSelection = [...selectedOptions];
    updatedSelection[index] = undefined;
    setSelectedOptions(updatedSelection);
  };

  const getQuestionWithFilledBlanks = (question: string, selected: (string | undefined)[]) => {
    let index = 0;
    return question.replace(/___________/g, () => {
      const word = selected[index];
      const display = word
        ? `<span class='filled-blank' data-index='${index}'>${word}</span>`
        : `<span class='empty-blank' data-index='${index}'>___________</span>`;
      index++;
      return display;
    });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('filled-blank') && target.dataset.index) {
        handleBlankClick(Number(target.dataset.index));
      } else if (target.classList.contains('empty-blank') && target.dataset.index) {
        handleBlankClick(Number(target.dataset.index));
      }
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [selectedOptions]);

  const handleNext = () => {
    const filteredSelections = selectedOptions.filter((opt): opt is string => typeof opt === 'string');
    const updatedAnswers = [...answers, {
      questionId: questions[currentIndex].questionId,
      selected: filteredSelections
    }];
    setAnswers(updatedAnswers);

    if (currentIndex < questions.length - 1) {
      const nextBlankCount = (questions[currentIndex + 1].question.match(/___________/g) || []).length;
      setCurrentIndex(currentIndex + 1);
      setSelectedOptions(new Array(nextBlankCount).fill(undefined));
      setTimer(30);
    } else {
      setStarted(false);
      setShowFeedback(true);
    }
  };

  const confirmQuit = () => setShowQuitConfirm(true);
  const handleCancelQuit = () => setShowQuitConfirm(false);
  const handleQuit = () => {
    setStarted(false);
    setShowQuitConfirm(false);
    setCurrentIndex(0);
    setSelectedOptions([]);
    setTimer(30);
  };

  const calculateScore = () => {
    let score = 0;
    answers.forEach((answer) => {
      const question = questions.find(q => q.questionId === answer.questionId);
      if (question && JSON.stringify(answer.selected) === JSON.stringify(question.correctAnswer)) {
        score += 1;
      }
    });
    return score;
  };
  const downloadResults = () => {
    const element = document.createElement("a");
    const text = answers.map((answer, index) => {
      const question = questions.find(q => q.questionId === answer.questionId);
      const isCorrect = JSON.stringify(answer.selected) === JSON.stringify(question?.correctAnswer);
      return `Q${index + 1}: ${question?.question}\nYour Answer: ${answer.selected.join(' ')}\nCorrect Answer: ${question?.correctAnswer.join(' ')}\nStatus: ${isCorrect ? 'Correct' : 'Incorrect'}\n`;
    }).join("\n--------------------------\n\n");
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;
    const file = new Blob([`Score: ${score}/${questions.length}\nPercentage: ${percentage.toFixed(2)}%\n\n${text}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "test_feedback.txt";
    document.body.appendChild(element);
    element.click();
  };

  const renderFeedback = () => (
    <div className="feedback-page">
       <Navbar /> 
    <div className="feedback-container" style={{ textAlign: 'left', maxHeight: '80vh', overflowY: 'scroll', padding: '1rem', position: 'relative' }}>
      
    <div style={{ display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
    marginTop:'5rem' }}>
    <CircularProgress percentage={(calculateScore() / questions.length) * 100} />
    
    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
      <p className="score-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Your Score: {calculateScore()} / {questions.length}</p>
      <p className="score-breakdown" style={{ fontSize: '1.2rem', color: '#555' }}>Percentage: {(calculateScore() / questions.length * 100).toFixed(2)}%</p>
      </div></div>

      {answers.map((answer, index) => {
        const question = questions.find(q => q.questionId === answer.questionId);
        const isCorrect = JSON.stringify(answer.selected) === JSON.stringify(question?.correctAnswer);
        return (
          
          <div key={index} className={`feedback-question ${isCorrect ? 'correct' : 'incorrect'}`}
          style={{
            marginBottom: '4rem', 
            marginTop: '4rem'// Adds gap between blocks
            
          }}>
            <p style={{ marginBottom: '3rem' }}><strong>Q{index + 1}:</strong> {question?.question}</p>
            <p style={{ marginBottom: '1rem' }}>

            <p style={{ marginTop: '1rem' ,  marginBottom: '1rem' }}>
  <strong>Status:</strong> {isCorrect ? '✅ Correct' : '❌ Incorrect'}
</p>

  <strong style={{ color: '#0d6efd' }}>Your Response:</strong>{' '}
  <span
    style={{
    
      padding: '0.3rem 0.5rem',
      borderRadius: '6px',
    }}
  >
    <strong>{answer.selected.join(' ,')}</strong>
  </span>
</p>

{!isCorrect && (
  <p style={{ marginBottom: '1rem' }}>
    <strong style={{ color: '#198754' }}>Correct Answer:</strong>{' '}
    <span
      style={{
       
        padding: '0.3rem 0.5rem',
        borderRadius: '6px',
      }}
    >
      <strong>{question?.correctAnswer.join(', ')}</strong>
    </span>
  </p>
)}

            <hr />
          </div>
        );
      })}
     <div style={{
    marginTop: '1rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'end',
    justifyContent: 'flex-end', // 👈 This aligns items to the right
  }}>
  <button className="custom-button" onClick={startTest} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
  <MdRestartAlt  fontSize={'1.5rem'}/>
  <span>Restart Test</span>
    </button>
  <button className="custom-button" onClick={downloadResults} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
  <FaDownload />
  <span>Download Results</span>
  </button>
  <button className="custom-button" onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
    <HiHome style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} /><span>Home</span>
  </button>
</div>

    </div>
    </div>
  );
  

  return (
    <div className={`homepage-container ${started ? 'question-bg' : ''}`}>
      {!started && !showFeedback && <Navbar />}
      <div className="box-content">
        {!started && !showFeedback ? (
          <>
            <div className="icon-container"><HiPencilSquare className="icon" /></div>
            <h2 className="main-heading">Sentence Construction</h2>
            <div className="sentence-container">
              <p className="sentence-part-one">Select the correct words to complete the sentence by arranging</p>
              <p className="sentence-part-two">the provided options in the right order.</p>
            </div>
            <div className="stats-container">
              <div className="stat-item">
                <p className="stat-label">Time Per Question</p>
                <div className="stat-value">30sec</div>
              </div>
              <div className="vertical-line"></div>
              <div className="stat-item middle">
                <p className="stat-label">Total Questions</p>
                <div className="stat-value">{questions.length}</div>
              </div>
              <div className="vertical-line"></div>
              <div className="stat-item">
                <div className="stat-label">Coins</div>
                <div className="coin-item">
                  <FaCoins className="coin-icon" />
                  <span className="coin-count">0</span>
                </div>
              </div>
            </div>
            <div className="buttons-container">
              <button className="start-button" onClick={startTest}>Start</button>
            </div>
          </>
        ) : started ? (
          <>
            <div className="question-box">
              <div className="progress-bar-container">
                <div className="completed-bar" style={{ width: `${(currentIndex + 1) / questions.length * 100}%` }} />
                <div className="remaining-bar" style={{ width: `${100 - (currentIndex + 1) / questions.length * 100}%` }} />
                <div className="progress-bar-text">{`Question ${currentIndex + 1} of ${questions.length}`}</div>
              </div>
              <div className="question-header">
                <div className="timer">Time Left: {timer}s</div>
                <button className="quit-button" onClick={confirmQuit}>Quit</button>
              </div>
              <h1 style = {{color:'gray' , marginTop:'-2rem',marginBottom:'1rem'}}>Select the missing words in the correct order </h1>
              <p><strong>Q{currentIndex + 1}:</strong> <span dangerouslySetInnerHTML={{ __html: getQuestionWithFilledBlanks(questions[currentIndex].question, selectedOptions) }} /></p>
              <div className="options-container">
                {questions[currentIndex].options.map((option: string, i: number) => (
                  !selectedOptions.includes(option) && (
                    <div
                      key={i}
                      className="option-item"
                      onClick={() => handleOptionClick(option)}
                    >
                      <strong>{option}</strong>
                    </div>
                  )
                ))}
              </div>
              {selectedOptions.some(item => item === undefined) && (
                <p className="fill-all-message" style={{ color: 'red', marginTop: '0.5rem' }}>
                  Please fill all blanks before proceeding.
                </p>
              )}
              <button
                className="next-button"
                onClick={handleNext}
                disabled={selectedOptions.some(item => item === undefined)}
              >
                {currentIndex === questions.length - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
            {showQuitConfirm && (
              <div className="quit-overlay">
                <div className="quit-confirm-box">
                  <p>Are you sure you want to quit?</p>
                  <p className="warning">None of your answers will be saved</p>
                  <div className="quit-buttons">
                    <button onClick={handleCancelQuit}>Cancel</button>
                    <button onClick={handleQuit}>Quit</button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : showFeedback && renderFeedback()}
      </div>
    </div>
  );
}

export default App;
