declare module "vue-material-design-icons/*.vue" {
  import { defineComponent } from "vue";
  export default defineComponent<{
    title?: string;
    fillColor?: string;
    size?: string;
  }>();
}
