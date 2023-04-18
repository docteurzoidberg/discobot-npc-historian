<template>
  <div>
    <h1>Hello {{ name }}!</h1>
    <p>You are now logged in, and you can use the site.</p> 
  </div>
</template>

<script setup>
const cookie = useCookie("factorio-auth-token", options);
console.log(cookie);
</script>