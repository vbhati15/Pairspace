import { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';

const LANGUAGE_OPTIONS = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'C++', value: 'cpp' },
];

const DEFAULT_CODE = {
  javascript: '// Start coding together\nconsole.log("Hello, room!");\n',
  python: '# Start coding together\nprint("Hello, room!")\n',
  typescript: '// Start coding together\nconst greeting: string = "Hello, room!";\nconsole.log(greeting);\n',
  cpp: '#include <iostream>\n\nint main() {\n  std::cout << "Hello, room!" << std::endl;\n  return 0;\n}\n',
};

export default function CodeEditor() {
  const editorRef = useRef(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_CODE.javascript);

  function handleEditorMount(editor) {
    editorRef.current = editor;
  }

  function handleLanguageChange(e) {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(DEFAULT_CODE[newLang]);
  }

  return (
    <div className="editor-wrapper">
      <div className="editor-toolbar">
        <select value={language} onChange={handleLanguageChange}>
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="room-status">● connected (local only — sync coming in Phase 2)</span>
      </div>

      <Editor
        height="70vh"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={(value) => setCode(value)}
        onMount={handleEditorMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}
