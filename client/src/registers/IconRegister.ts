import Vue from "vue";

// Icons used in the application
import CloseIcon from "vue-material-design-icons/Close.vue";
import PlayIcon from "vue-material-design-icons/PlayOutline.vue";
import PauseIcon from "vue-material-design-icons/Pause.vue";
import UploadIcon from "vue-material-design-icons/Upload.vue";
import DownloadIcon from "vue-material-design-icons/DownloadOutline.vue";
import CheckIcon from "vue-material-design-icons/Check.vue";
import SyncIcon from "vue-material-design-icons/Sync.vue";

const ICONS_MAP = {
    CloseIcon,
    PlayIcon,
    PauseIcon,
    UploadIcon,
    DownloadIcon,
    CheckIcon,
    SyncIcon
};

export function register() {
    // Register each icon globally
    Object.entries(ICONS_MAP).forEach(([name, component]) => Vue.component(name, component));
}