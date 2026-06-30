import CodeEditor from './components/CodeEditor';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>PairSpace</h1>
        <p className="subtitle">Real-time collaborative code editor</p>
      </header>
      <CodeEditor />
    </div>
  );
}

export default App;
