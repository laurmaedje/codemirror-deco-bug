import { standardKeymap } from "@codemirror/commands";
import {
  EditorState,
  RangeSetBuilder,
  StateEffect,
  StateField,
  Text,
} from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
  keymap,
} from "@codemirror/view";

// The state effect that updates the decorations.
const setDecosEffect = StateEffect.define<DecorationSet>();

// Holds the current decorations.
const decoState = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(value, tr) {
    if (tr.docChanged) {
      try {
        value = value.map(tr.changes);
      } catch (e) {
        console.warn(e);
        value = Decoration.none;
      }
    }
    for (const effect of tr.effects) {
      if (effect.is(setDecosEffect)) {
        value = effect.value;
      }
    }
    return value;
  },
  provide: (f) => EditorView.decorations.from(f),
});

class DecoPlugin {
  constructor(readonly view: EditorView) {}

  update(update: ViewUpdate) {
    if (update.docChanged) {
      this.run();
    }
  }

  async run() {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const builder: RangeSetBuilder<Decoration> = new RangeSetBuilder();
    if (view.state.doc.length > 0) {
      builder.add(0, 1, Decoration.mark({ class: undefined }));
      builder.add(
        1,
        1,
        Decoration.widget({
          widget: new DiagnosticWidget(),
        })
      );
    }

    this.view.dispatch({
      effects: [setDecosEffect.of(builder.finish())],
    });
  }
}

class DiagnosticWidget extends WidgetType {
  constructor() {
    super();
  }

  eq() {
    return true;
  }

  toDOM() {
    return document.createElement("span");
  }
}

const view = new EditorView({
  state: EditorState.create({
    doc: Text.of([""]),
    extensions: [
      keymap.of(standardKeymap),
      decoState,
      ViewPlugin.fromClass(DecoPlugin),
    ],
  }),
});

document.body.replaceChildren(view.dom);
