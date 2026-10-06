import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
    Bold,
    Heading2,
    Heading3,
    Italic,
    Link2,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo2,
    Underline,
    Undo2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function ToolbarButton({
    label,
    icon: Icon,
    active = false,
    disabled = false,
    onClick,
}: {
    label: string;
    icon: LucideIcon;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={cn(
                "text-muted-foreground hover:bg-accent hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-md transition-colors disabled:opacity-40",
                active && "bg-accent text-foreground",
            )}
        >
            <Icon className="size-4" />
        </button>
    );
}

/**
 * WYSIWYG editor for CMS content. Emits sanitised-on-the-server HTML through
 * `onChange`; the server remains the source of truth for what is allowed.
 */
export function RichTextEditor({
    value,
    onChange,
    invalid = false,
}: {
    value: string;
    onChange: (html: string) => void;
    invalid?: boolean;
}) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3, 4] },
                link: { openOnClick: false, autolink: true },
            }),
        ],
        content: value,
        immediatelyRender: false,
        shouldRerenderOnTransaction: true,
        editorProps: {
            attributes: {
                class: "cms-content min-h-[55vh] px-4 py-4 outline-none sm:px-6 sm:py-5 xl:min-h-[calc(100vh-20rem)]",
                "aria-label": "Page content",
            },
        },
        onUpdate: ({ editor: current }) => {
            onChange(current.isEmpty ? "" : current.getHTML());
        },
    });

    if (!editor) {
        return (
            <div className="bg-muted/30 h-[420px] animate-pulse rounded-md border" />
        );
    }

    const setLink = () => {
        const previous = editor.getAttributes("link").href as
            | string
            | undefined;
        const url = window.prompt("Link URL", previous ?? "https://");

        if (url === null) {
            return;
        }

        if (url.trim() === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();

            return;
        }

        editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url.trim() })
            .run();
    };

    return (
        <div
            className={cn(
                "bg-background focus-within:border-ring focus-within:ring-ring/50 overflow-clip rounded-md border focus-within:ring-[3px]",
                invalid && "border-destructive",
            )}
        >
            <div
                role="toolbar"
                aria-label="Formatting"
                className="bg-muted sticky top-0 z-10 flex items-center gap-0.5 overflow-x-auto border-b p-1.5 sm:flex-wrap sm:overflow-x-visible"
            >
                <ToolbarButton
                    label="Heading"
                    icon={Heading2}
                    active={editor.isActive("heading", { level: 2 })}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                />
                <ToolbarButton
                    label="Subheading"
                    icon={Heading3}
                    active={editor.isActive("heading", { level: 3 })}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                />
                <span className="bg-border mx-1 h-5 w-px shrink-0" />
                <ToolbarButton
                    label="Bold"
                    icon={Bold}
                    active={editor.isActive("bold")}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                />
                <ToolbarButton
                    label="Italic"
                    icon={Italic}
                    active={editor.isActive("italic")}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                />
                <ToolbarButton
                    label="Underline"
                    icon={Underline}
                    active={editor.isActive("underline")}
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                />
                <span className="bg-border mx-1 h-5 w-px shrink-0" />
                <ToolbarButton
                    label="Bulleted list"
                    icon={List}
                    active={editor.isActive("bulletList")}
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                />
                <ToolbarButton
                    label="Numbered list"
                    icon={ListOrdered}
                    active={editor.isActive("orderedList")}
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                />
                <ToolbarButton
                    label="Quote"
                    icon={Quote}
                    active={editor.isActive("blockquote")}
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                />
                <ToolbarButton
                    label="Divider"
                    icon={Minus}
                    onClick={() =>
                        editor.chain().focus().setHorizontalRule().run()
                    }
                />
                <ToolbarButton
                    label="Link"
                    icon={Link2}
                    active={editor.isActive("link")}
                    onClick={setLink}
                />
                <span className="bg-border mx-1 h-5 w-px shrink-0" />
                <ToolbarButton
                    label="Undo"
                    icon={Undo2}
                    disabled={!editor.can().undo()}
                    onClick={() => editor.chain().focus().undo().run()}
                />
                <ToolbarButton
                    label="Redo"
                    icon={Redo2}
                    disabled={!editor.can().redo()}
                    onClick={() => editor.chain().focus().redo().run()}
                />
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
