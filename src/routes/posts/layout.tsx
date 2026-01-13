import { component$ } from "@builder.io/qwik";
import { Slot } from "@builder.io/qwik";

export default component$(() => {
  return (
    <article class="post-shell section">
      <div class="container">
        <div class="content">
          <Slot />
        </div>
      </div>
    </article>
  );
});
