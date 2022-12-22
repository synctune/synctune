<template>
  <div id="PageNotFound">
    <div id="PageNotFound__content">
      <div id="PageNotFound__title">404</div>

      <div id="PageNotFound__text">Page Not Found</div>

      <ButtonSecondary id="PageNotFound__home-button" to="/">
        Back to Home
      </ButtonSecondary>
    </div>
  </div>
</template>

<script setup lang="ts">
import ButtonSecondary from "@/components/ui/button/ButtonSecondary.vue";
</script>

<style lang="scss">
#PageNotFound {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  & #PageNotFound__content {
    text-align: center;

    & #PageNotFound__title {
      font-size: 5rem;
      font-weight: 600;
    }

    & #PageNotFound__text {
      font-size: 2rem;

      margin-bottom: 3rem;
    }
  }
}
</style>
