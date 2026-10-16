/* Orbit Editor — CodeMirror 6 loader */
(function () {
  'use strict';

  const CDN = 'https://esm.sh';

  Promise.all([
    import(`${CDN}/codemirror@6.0.1`),
    import(`${CDN}/@codemirror/state@6`),
    import(`${CDN}/@codemirror/lang-html@6`),
    import(`${CDN}/@codemirror/lang-css@6`),
    import(`${CDN}/@codemirror/lang-javascript@6`),
    import(`${CDN}/@codemirror/lang-markdown@6`),
    import(`${CDN}/@codemirror/lang-json@6`),
    import(`${CDN}/@codemirror/theme-one-dark@6`),
    import(`${CDN}/@codemirror/view@6`),
    import(`${CDN}/@codemirror/commands@6`),
  ])
    .then((m) => {
      const {
        EditorView, basicSetup,
      } = m[0];
      const { EditorState, Compartment } = m[1];
      const langHtml = m[2].html;
      const langCss = m[3].css;
      const langJs = m[4].javascript;
      const langMd = m[5].markdown;
      const langJson = m[6].json;
      const { oneDark } = m[7];
      const { keymap } = m[8];
      const { indentWithTab } = m[9];

      const host = document.getElementById('editorContent');
      if (!host) return;

      const langComp = new Compartment();
      const editableComp = new Compartment();

      const LANGS = {
        HTML: () => langHtml(),
        CSS: () => langCss(),
        JS: () => langJs(),
        JSX: () => langJs({ jsx: true }),
        TS: () => langJs({ typescript: true }),
        TSX: () => langJs({ typescript: true, jsx: true }),
        JSON: () => langJson(),
        MD: () => langMd(),
        SVG: () => langHtml(),
        XML: () => langHtml(),
        YAML: () => [],
        TXT: () => [],
      };

      let changeFn = null;

      const editor = new EditorView({
        parent: host,
        state: EditorState.create({
          doc: '',
          extensions: [
            basicSetup,
            oneDark,
            keymap.of([indentWithTab]),
            langComp.of([]),
            editableComp.of(EditorView.editable.of(true)),
            EditorView.updateListener.of((u) => {
              if (u.docChanged && changeFn) changeFn();
            }),
            EditorView.theme({
              '&': { height: '100%', fontSize: '12.5px', backgroundColor: '#0d1117' },
              '.cm-scroller': { overflow: 'auto' },
              '.cm-content': { padding: '10px 0' },
            }),
          ],
        }),
      });

      // force scroller bg
      setTimeout(() => {
        const sc = host.querySelector('.cm-scroller');
        if (sc) sc.style.background = '#0d1117';
      }, 0);

      window.__orbitCM = {
        view: editor,
        getValue: () => editor.state.doc.toString(),
        setValue: (v) => {
          editor.dispatch({
            changes: { from: 0, to: editor.state.doc.length, insert: v || '' },
          });
          editor.scrollDOM.scrollTop = 0;
        },
        setLang: (name) => {
          editor.dispatch({
            effects: langComp.reconfigure((LANGS[name] || LANGS.TXT)()),
          });
        },
        setDisabled: (d) => {
          editor.dispatch({
            effects: editableComp.reconfigure(EditorView.editable.of(!d)),
          });
        },
        focus: () => editor.focus(),
        onChange: (fn) => { changeFn = fn; },
      };

      host.classList.remove('is-loading');
      window.dispatchEvent(new Event('orbit-cm-ready'));
    })
    .catch((err) => {
      console.error('[Orbit] CodeMirror load failed:', err);
      const host = document.getElementById('editorContent');
      if (host) {
        host.classList.remove('is-loading');
        host.innerHTML =
          '<div style="padding:20px;color:#f87171;font-family:JetBrains Mono,monospace;font-size:12px">' +
          'CodeMirror failed: ' + (err && err.message ? err.message : 'unknown') + '</div>';
      }
      window.dispatchEvent(new Event('orbit-cm-failed'));
    });
})();