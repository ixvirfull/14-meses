document.addEventListener("DOMContentLoaded", () => {
    const revealElements = document.querySelectorAll(".reveal");

    // Animaciones al aparecer los elementos en pantalla
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries, currentObserver) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        currentObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        revealElements.forEach((element) => {
            observer.observe(element);
        });
    } else {
        revealElements.forEach((element) => {
            element.classList.add("visible");
        });
    }

    // Evita que las imagenes inexistentes muestren el icono roto
    document.querySelectorAll(".memory-image img").forEach((img) => {
        img.addEventListener("error", () => {
            img.style.display = "none";
            img.parentElement.classList.add("image-missing");
        }, { once: true });
    });

    // Animacion de desplazamiento para los enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (target) {
                event.preventDefault();

                target.scrollIntoView({
                    behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches ? "auto" : "smooth",
                    block: "start"
                });
            }
        });
    });
});


/* ========================================
   VISOR DE FOTOGRAFIAS
======================================== */

(() => {
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const lightboxCounter = document.getElementById("lightboxCounter");
    const closeButton = document.getElementById("lightboxClose");
    const prevButton = document.getElementById("lightboxPrev");
    const nextButton = document.getElementById("lightboxNext");

    if (
        !lightbox ||
        !lightboxImage ||
        !lightboxCaption ||
        !lightboxCounter ||
        !closeButton ||
        !prevButton ||
        !nextButton
    ) {
        return;
    }

    // Obtener las imagenes de la galeria en su orden original.
    const galleryImages = Array.from(
        document.querySelectorAll(".memory-image img")
    ).filter((img) => img.getAttribute("src"));

    if (!galleryImages.length) return;

    let currentIndex = 0;
    let previousFocus = null;
    let touchStartX = 0;
    let touchStartY = 0;

    function showImage(index) {
        currentIndex =
            (index + galleryImages.length) % galleryImages.length;

        const original = galleryImages[currentIndex];
        const card = original.closest(".memory-card");
        const title = card?.querySelector("h3")?.textContent?.trim() || "";

        lightboxImage.src = original.currentSrc || original.src;
        lightboxImage.alt = original.alt || title;
        lightboxCaption.textContent = title;
        lightboxCounter.textContent =
            `${currentIndex + 1} / ${galleryImages.length}`;

        // Ocultar la flecha si solo hay una foto.
        const showArrows = galleryImages.length > 1;
        prevButton.hidden = !showArrows;
        nextButton.hidden = !showArrows;
    }

    function openLightbox(index) {
        previousFocus = document.activeElement;

        showImage(index);

        lightbox.classList.add("active");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");

        closeButton.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove("active");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.classList.remove("lightbox-open");

        lightboxImage.removeAttribute("src");

        if (previousFocus && typeof previousFocus.focus === "function") {
            previousFocus.focus();
        }
    }

    function showNext() {
        showImage(currentIndex + 1);
    }

    function showPrevious() {
        showImage(currentIndex - 1);
    }

    // Abrir al pulsar cualquiera de las fotografias.
    galleryImages.forEach((img, index) => {
        img.addEventListener("click", () => {
            openLightbox(index);
        });

        img.setAttribute("tabindex", "0");
        img.setAttribute("role", "button");

        img.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openLightbox(index);
            }
        });
    });

    // Controles de navegacion.
    closeButton.addEventListener("click", closeLightbox);
    nextButton.addEventListener("click", showNext);
    prevButton.addEventListener("click", showPrevious);

    // Cerrar al pulsar fuera de la imagen.
    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    // Navegacion mediante teclado.
    document.addEventListener("keydown", (event) => {
        if (!lightbox.classList.contains("active")) return;

        if (event.key === "Escape") {
            closeLightbox();
        } else if (event.key === "ArrowRight") {
            showNext();
        } else if (event.key === "ArrowLeft") {
            showPrevious();
        }
    });

    // Deslizar a izquierda o derecha en dispositivos tactiles.
    lightbox.addEventListener("touchstart", (event) => {
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });

    lightbox.addEventListener("touchend", (event) => {
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        if (
            Math.abs(deltaX) < 50 ||
            Math.abs(deltaX) < Math.abs(deltaY)
        ) {
            return;
        }

        if (deltaX < 0) {
            showNext();
        } else {
            showPrevious();
        }
    }, { passive: true });
})();