import { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const LANGUAGE_OPTIONS = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'C++', value: 'cpp' },
];

const DEFAULT_CODE = {
  javascript: '// Start coding together\nconsole.log("Hello, PairSpace!");\n',
  python: '# Start coding together\nprint("Hello, PairSpace!")\n',
  typescript: '// Start coding together\nconst greeting: string = "Hello, PairSpace!";\nconsole.log(greeting);\n',
  cpp: '// Start coding together\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, PairSpace!" << endl;\n    return 0;\n}\n',
};

function randomColor() {
  const colors = ['#f87171', '#fb923c', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function randomName() {
  const adjectives = ['Fast', 'Clever', 'Silent', 'Bold', 'Swift'];
  const nouns = ['Coder', 'Dev', 'Hacker', 'Builder', 'Ninja'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`;
}

function getRoomId() {
  if (!window.location.hash) {
    const id = Math.random().toString(36).substring(2, 10);
    window.location.hash = id;
  }
  return window.location.hash.slice(1);
}

const WS_SERVER = 'ws://localhost:1234';

export default function CodeEditor() {
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const ydocRef = useRef(null);
  const ytextRef = useRef(null);
  const isSyncingRef = useRef(false);

  const [language, setLanguage] = useState('javascript');
  const [status, setStatus] = useState('connecting');
  const [activeUsers, setActiveUsers] = useState([]);
  const [roomId] = useState(getRoomId);
  const [userName] = useState(randomName);
  const [userColor] = useState(randomColor);

  function handleEditorMount(editor) {
    editorRef.current = editor;

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const provider = new WebsocketProvider(WS_SERVER, roomId, ydoc);
    providerRef.current = provider;

    provider.awareness.setLocalStateField('user', {
      name: userName,
      color: userColor,
    });

    provider.on('status', ({ status }) => setStatus(status));

    provider.awareness.on('change', () => {
      const states = Array.from(provider.awareness.getStates().values());
      const users = states.filter((s) => s.user).map((s) => s.user);
      setActiveUsers(users);
    });

    const ytext = ydoc.getText('monaco');
    ytextRef.current = ytext;

    // When synced, set default only if doc is empty
    provider.on('sync', (isSynced) => {
      if (isSynced && ytext.length === 0) {
        ytext.insert(0, DEFAULT_CODE[language]);
        editor.setValue(DEFAULT_CODE[language]);
      } else if (isSynced) {
        isSyncingRef.current = true;
        editor.setValue(ytext.toString());
        isSyncingRef.current = false;
      }
    });

    // Y.js → Monaco: apply remote changes
    ytext.observe((event) => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;

      const model = editor.getModel();
      if (!model) { isSyncingRef.current = false; return; }

      const newValue = ytext.toString();
      const currentValue = model.getValue();

      if (newValue !== currentValue) {
        const position = editor.getPosition();
        const selection = editor.getSelection();

        model.pushEditOperations(
          [],
          [{ range: model.getFullModelRange(), text: newValue }],
          () => null
        );

        if (position) editor.setPosition(position);
        if (selection) editor.setSelection(selection);
      }

      isSyncingRef.current = false;
    });

    // Monaco → Y.js: push local changes
    editor.onDidChangeModelContent((event) => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;

      const currentValue = editor.getValue();
      const yjsValue = ytext.toString();

      if (currentValue !== yjsValue) {
        ydoc.transact(() => {
          event.changes
            .sort((a, b) => b.rangeOffset - a.rangeOffset)
            .forEach((change) => {
              ytext.delete(change.rangeOffset, change.rangeLength);
              if (change.text) {
                ytext.insert(change.rangeOffset, change.text);
              }
            });
        });
      }

      isSyncingRef.current = false;
    });

    // Broadcast cursor position
    editor.onDidChangeCursorPosition((e) => {
      provider.awareness.setLocalStateField('cursor', {
        line: e.position.lineNumber,
        column: e.position.column,
        color: userColor,
        name: userName,
      });
    });
  }

  useEffect(() => {
    return () => {
      providerRef.current?.destroy();
      ydocRef.current?.destroy();
    };
  }, []);

  function handleLanguageChange(e) {
    setLanguage(e.target.value);
  }

  const statusColor = {
    connected: '#34d399',
    connecting: '#fbbf24',
    disconnected: '#f87171',
  }[status] || '#fbbf24';

  function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}#${roomId}`;
    navigator.clipboard.writeText(url);
    alert('Room link copied! Share it with your collaborators.');
  }

  return (
    <div className="editor-wrapper">
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <select value={language} onChange={handleLanguageChange}>
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="room-id">Room: {roomId}</span>
        </div>

        <div className="toolbar-right">
          <div className="active-users">
            {activeUsers.map((user, i) => (
              <span
                key={i}
                className="user-badge"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {user.name[0]}
              </span>
            ))}
          </div>
          <button className="share-btn" onClick={copyLink}>Share Room</button>
          <span className="status-dot" style={{ color: statusColor }}>● {status}</span>
        </div>
      </div>

      <Editor
        height="75vh"
        language={language}
        theme="vs-dark"
        onMount={handleEditorMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          cursorBlinking: 'smooth',
        }}
      />

      <div className="editor-footer">
        <span>You are <strong style={{ color: userColor }}>{userName}</strong></span>
        <span>{activeUsers.length} user{activeUsers.length !== 1 ? 's' : ''} in room</span>
      </div>
    </div>
  );
}