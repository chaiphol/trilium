import utils from "./utils.js";
import linkService from "./link.js";
import zoomService from "./zoom.js";
import protectedSessionService from "./protected_session.js";
import searchNotesService from "./search_notes.js";
import treeService from "./tree.js";
import server from "./server.js";

const NOTE_REVISIONS = "../dialogs/note_revisions.js";
const OPTIONS = "../dialogs/options.js";
const ADD_LINK = "../dialogs/add_link.js";
const JUMP_TO_NOTE = "../dialogs/jump_to_note.js";
const NOTE_SOURCE = "../dialogs/note_source.js";
const RECENT_CHANGES = "../dialogs/recent_changes.js";
const SQL_CONSOLE = "../dialogs/sql_console.js";
const ATTRIBUTES = "../dialogs/attributes.js";
const HELP = "../dialogs/help.js";
const NOTE_INFO = "../dialogs/note_info.js";
const ABOUT = "../dialogs/about.js";
const LINK_MAP = "../dialogs/link_map.js";
const CLONE_TO = "../dialogs/clone_to.js";
const MOVE_TO = "../dialogs/move_to.js";

function registerEntrypoints() {
    // hot keys are active also inside inputs and content editables
    jQuery.hotkeys.options.filterInputAcceptingElements = false;
    jQuery.hotkeys.options.filterContentEditable = false;
    jQuery.hotkeys.options.filterTextInputs = false;

    setActionHandler("AddLinkToText", () => import(ADD_LINK).then(d => d.showDialog()));

    const showJumpToNoteDialog = () => import(JUMP_TO_NOTE).then(d => d.showDialog());
    $("#jump-to-note-dialog-button").on('click', showJumpToNoteDialog);
    setActionHandler("JumpToNote", showJumpToNoteDialog);

    const showRecentChanges = () => import(RECENT_CHANGES).then(d => d.showDialog());
    $("#recent-changes-button").on('click', showRecentChanges);
    setActionHandler("ShowRecentChanges", showRecentChanges);

    $("#enter-protected-session-button").on('click', protectedSessionService.enterProtectedSession);
    $("#leave-protected-session-button").on('click', protectedSessionService.leaveProtectedSession);

    $("#toggle-search-button").on('click', searchNotesService.toggleSearch);
    setActionHandler('SearchNotes', searchNotesService.toggleSearch);

    const $noteTabContainer = $("#note-tab-container");

    const showAttributesDialog = () => import(ATTRIBUTES).then(d => d.showDialog());
    $noteTabContainer.on("click", ".show-attributes-button", showAttributesDialog);
    setActionHandler("ShowAttributes", showAttributesDialog);

    const showNoteInfoDialog = () => import(NOTE_INFO).then(d => d.showDialog());
    $noteTabContainer.on("click", ".show-note-info-button", showNoteInfoDialog);
    setActionHandler("ShowNoteInfo", showNoteInfoDialog);

    const showNoteRevisionsDialog = function() {
        if ($(this).hasClass("disabled")) {
            return;
        }

        import(NOTE_REVISIONS).then(d => d.showCurrentNoteRevisions());
    };

    $noteTabContainer.on("click", ".show-note-revisions-button", showNoteRevisionsDialog);
    setActionHandler("ShowNoteRevisions", showNoteRevisionsDialog);

    const showNoteSourceDialog = function() {
        if ($(this).hasClass("disabled")) {
            return;
        }

        import(NOTE_SOURCE).then(d => d.showDialog());
    };

    $noteTabContainer.on("click", ".show-source-button", showNoteSourceDialog);
    setActionHandler("ShowNoteSource", showNoteSourceDialog);

    const showLinkMapDialog = () => import(LINK_MAP).then(d => d.showDialog());
    $noteTabContainer.on("click", ".show-link-map-button", showLinkMapDialog);
    setActionHandler("ShowLinkMap", showLinkMapDialog);

    const showOptionsDialog = () => import(OPTIONS).then(d => d.showDialog());
    $("#options-button").on('click', showOptionsDialog);
    setActionHandler("ShowOptions", showOptionsDialog);

    const showHelpDialog = () => import(HELP).then(d => d.showDialog());
    $("#show-help-button").on('click', showHelpDialog);
    setActionHandler("ShowHelp", showHelpDialog);

    const showSqlConsoleDialog = () => import(SQL_CONSOLE).then(d => d.showDialog());
    $("#open-sql-console-button").on('click', showSqlConsoleDialog);
    setActionHandler("ShowSQLConsole", showSqlConsoleDialog);

    $("#show-about-dialog-button").on('click', () => import(ABOUT).then(d => d.showDialog()));

    if (utils.isElectron()) {
        $("#history-navigation").show();
        $("#history-back-button").on('click', window.history.back);
        setActionHandler("BackInNoteHistory", window.history.back);

        $("#history-forward-button").on('click', window.history.forward);
        setActionHandler("ForwardInNoteHistory", window.history.forward);
    }

    // hide (toggle) everything except for the note content for zen mode
    const toggleZenMode = () => {
        $(".hide-in-zen-mode").toggle();
        $("#container").toggleClass("zen-mode");
    };

    $("#toggle-zen-mode-button").on('click', toggleZenMode);
    setActionHandler("ToggleZenMode", toggleZenMode);

    setActionHandler("InsertDateTime", () => {
        const date = new Date();
        const dateString = utils.formatDateTime(date);

        linkService.addTextToEditor(dateString);
    });

    $("#reload-frontend-button").on('click', utils.reloadApp);
    setActionHandler("ReloadApp", utils.reloadApp);

    $("#open-dev-tools-button").toggle(utils.isElectron());

    if (utils.isElectron()) {
        const openDevTools = () => {
            require('electron').remote.getCurrentWindow().toggleDevTools();

            return false;
        };

        $("#open-dev-tools-button").on('click', openDevTools);
        setActionHandler("OpenDevTools", openDevTools);
    }

    let findInPage;

    if (utils.isElectron()) {
        const { remote } = require('electron');
        const { FindInPage } = require('electron-find');

        findInPage = new FindInPage(remote.getCurrentWebContents(), {
            offsetTop: 10,
            offsetRight: 10,
            boxBgColor: 'var(--main-background-color)',
            boxShadowColor: '#000',
            inputColor: 'var(--input-text-color)',
            inputBgColor: 'var(--input-background-color)',
            inputFocusColor: '#555',
            textColor: 'var(--main-text-color)',
            textHoverBgColor: '#555',
            caseSelectedColor: 'var(--main-border-color)'
        });

        setActionHandler("FindInText", () => findInPage.openFindWindow());
    }

    if (utils.isElectron()) {
        const toggleFullscreen = () => {
            const win = require('electron').remote.getCurrentWindow();

            if (win.isFullScreenable()) {
                win.setFullScreen(!win.isFullScreen());
            }

            return false;
        };

        $("#toggle-fullscreen-button").on('click', toggleFullscreen);

        setActionHandler("ToggleFullscreen", toggleFullscreen);
    }
    else {
        // outside of electron this is handled by the browser
        $("#toggle-fullscreen-button").hide();
    }

    if (utils.isElectron()) {
        setActionHandler("ZoomOut", zoomService.decreaseZoomFactor);
        setActionHandler("ZoomIn", zoomService.increaseZoomFactor);
    }

    $(document).on('click', "a[data-action='note-revision']", async event => {
        const linkEl = $(event.target);
        const noteId = linkEl.attr('data-note-path');
        const noteRevisionId = linkEl.attr('data-note-revision-id');

        const attributesDialog = await import("../dialogs/note_revisions.js");

        attributesDialog.showNoteRevisionsDialog(noteId, noteRevisionId);

        return false;
    });

    setActionHandler("CloneNotesTo", () => import(CLONE_TO).then(d => {
        const activeNode = treeService.getActiveNode();

        const selectedOrActiveNodes = treeService.getSelectedOrActiveNodes(activeNode);

        const noteIds = selectedOrActiveNodes.map(node => node.data.noteId);

        d.showDialog(noteIds);
    }));

    setActionHandler("MoveNotesTo", () => import(MOVE_TO).then(d => {
        const activeNode = treeService.getActiveNode();

        const selectedOrActiveNodes = treeService.getSelectedOrActiveNodes(activeNode);

        d.showDialog(selectedOrActiveNodes);
    }));
}

class KeyboardAction {
    constructor(params) {
        /** @property {string} */
        this.actionName = params.actionName;
        /** @property {string[]} */
        this.defaultShortcuts = params.defaultShortcuts;
        /** @property {string[]} */
        this.effectiveShortcuts = params.effectiveShortcuts;
        /** @property {string} */
        this.description = params.description;
    }

    addShortcut(shortcut) {
        this.effectiveShortcuts.push(shortcut);
    }

    /**
     * @param {string|string[]} shortcuts
     */
    replaceShortcuts(shortcuts) {
        this.effectiveShortcuts = Array.isArray(shortcuts) ? shortcuts : [shortcuts];
    }
}

const keyboardActionRepo = {};

const keyboardActionsLoaded = server.get('keyboard-actions').then(actions => {
    for (const action of actions) {
        keyboardActionRepo[action.actionName] = new KeyboardAction(action);
    }
});

function setActionHandler(actionName, handler) {
    keyboardActionsLoaded.then(() => {
        const action = keyboardActionRepo[actionName];

        if (!action) {
            throw new Error(`Cannot find keyboard action '${actionName}'`);
        }

        action.handler = handler;

        for (const shortcut of action.effectiveShortcuts) {
            utils.bindGlobalShortcut(shortcut, handler);
        }
    });
}

export default {
    registerEntrypoints
}