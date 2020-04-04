import Vue from "vue";

// Icons used in the application
import CloseIcon from "vue-material-design-icons/Close.vue";
import PlayIcon from "vue-material-design-icons/Play.vue";
import PauseIcon from "vue-material-design-icons/Pause.vue";
import StopIcon from "vue-material-design-icons/Stop.vue";
import UploadIcon from "vue-material-design-icons/UploadOutline.vue";
import DownloadIcon from "vue-material-design-icons/DownloadOutline.vue";
import CheckIcon from "vue-material-design-icons/CheckUnderline.vue";
import SyncIcon from "vue-material-design-icons/Sync.vue";
import PlusIcon from "vue-material-design-icons/Plus.vue";
import MinusIcon from "vue-material-design-icons/WindowMinimize.vue";
import UndoIcon from "vue-material-design-icons/Undo.vue";
import RedoIcon from "vue-material-design-icons/Redo.vue";
import BackIcon from "vue-material-design-icons/ChevronLeft.vue";
import NextIcon from "vue-material-design-icons/ChevronRight.vue";

const ICONS_MAP = {
    CloseIcon,
    PlayIcon,
    StopIcon,
    PauseIcon,
    UploadIcon,
    DownloadIcon,
    CheckIcon,
    SyncIcon,
    PlusIcon,
    MinusIcon,
    UndoIcon,
    RedoIcon,
    BackIcon,
    NextIcon
};

export function register() {
    // Register each icon globally
    Object.entries(ICONS_MAP).forEach(([name, component]) => Vue.component(name, component));
}