import { component$ } from "@builder.io/qwik";
import { Slot } from "@builder.io/qwik";

export default component$(() => {
  return (
    <article
      class="post-shell card border border-base-300 bg-base-200/60 shadow-xl enter"
      style={{ "--delay": "0.06s" }}
    >
      <div class="card-body post-content">
        <Slot />
      </div>
    </article>
  );
});
