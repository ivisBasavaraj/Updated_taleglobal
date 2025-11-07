(function ($) {
  "use strict";

  const syncBodyState = () => {
    const activeModal = document.querySelector(".modal.show");

    if (activeModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("padding-right");
    }
  };

  document.addEventListener("shown.bs.modal", () => {
    document.body.classList.add("modal-open");
  });

  document.addEventListener("hidden.bs.modal", syncBodyState);

  document.addEventListener("hide.bs.modal", () => {
    const backdrop = document.querySelector(".modal-backdrop");

    if (!backdrop) {
      syncBodyState();
    }
  });

  $(document).ready(function () {
    const sidebarSelector = "#sidebar-admin-wraper";
    const overlaySelector = ".sidebar-overlay";
    const headerSelector = "#header-admin";
    const contentSelector = "#content";

    const applyMobileState = () => {
      const sidebar = $(sidebarSelector);
      sidebar.removeClass("active");
      document.body.classList.remove("candidate-sidebar-open", "sidebar-open");
      $(overlaySelector).removeClass("active");
      $(headerSelector).css({ left: "0", width: "100%" });
      $(contentSelector).css({ "margin-left": "0", width: "100%" });
    };

    const applyDesktopExpandedState = () => {
      const sidebar = $(sidebarSelector);
      sidebar.removeClass("collapsed").addClass("active");
      $(headerSelector).css({ left: "280px", width: "calc(100% - 280px)" });
      $(contentSelector).css({ "margin-left": "280px", width: "calc(100% - 280px)" });
    };

    const applyDesktopCollapsedState = () => {
      const sidebar = $(sidebarSelector);
      sidebar.addClass("collapsed").removeClass("active");
      $(headerSelector).css({ left: "0", width: "100%" });
      $(contentSelector).css({ "margin-left": "0", width: "100%" });
    };

    const refreshSidebarState = () => {
      const isMobile = $(window).width() <= 991;

      if (isMobile) {
        if ($(".mobile-menu-toggle").length) {
          $(".mobile-menu-toggle").show();
        }
        applyMobileState();
      } else {
        if ($(".mobile-menu-toggle").length) {
          $(".mobile-menu-toggle").hide();
        }

        if (document.body.classList.contains("candidate-sidebar-expanded")) {
          applyDesktopExpandedState();
        } else if (document.body.classList.contains("candidate-sidebar-collapsed")) {
          applyDesktopCollapsedState();
        } else {
          applyDesktopExpandedState();
        }

        $(overlaySelector).removeClass("active");
      }
    };

    $(document).on("click", ".mobile-menu-toggle", function () {
      const sidebar = $(sidebarSelector);
      const isOpen = sidebar.hasClass("active") || document.body.classList.contains("candidate-sidebar-open");

      if ($(window).width() <= 991) {
        if (isOpen) {
          sidebar.removeClass("active");
          document.body.classList.remove("candidate-sidebar-open", "sidebar-open");
          $(overlaySelector).removeClass("active");
        } else {
          sidebar.addClass("active");
          document.body.classList.add("candidate-sidebar-open", "sidebar-open");
          $(overlaySelector).addClass("active");
        }
      }
    });

    $(document).on("click", overlaySelector, function () {
      $(sidebarSelector).removeClass("active");
      document.body.classList.remove("candidate-sidebar-open", "sidebar-open");
      $(overlaySelector).removeClass("active");
    });

    $("#sidebarCollapse").on("click", function () {
      const sidebar = $(sidebarSelector);
      const isCollapsed = sidebar.hasClass("collapsed") || document.body.classList.contains("candidate-sidebar-collapsed");

      if (isCollapsed) {
        sidebar.removeClass("collapsed");
        document.body.classList.remove("candidate-sidebar-collapsed");
        document.body.classList.add("candidate-sidebar-expanded");
        $(headerSelector).css({ left: "280px", width: "calc(100% - 280px)" });
        $(contentSelector).css({ "margin-left": "280px", width: "calc(100% - 280px)" });
      } else {
        sidebar.addClass("collapsed");
        document.body.classList.remove("candidate-sidebar-expanded");
        document.body.classList.add("candidate-sidebar-collapsed");
        $(headerSelector).css({ left: "0", width: "100%" });
        $(contentSelector).css({ "margin-left": "0", width: "100%" });
      }
    });

    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          refreshSidebarState();
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"]
    });

    refreshSidebarState();
    $(window).on("resize", refreshSidebarState);

    if (window.location.pathname.includes("/candidate") || window.location.pathname.includes("/can")) {
      setTimeout(function () {
        const sidebar = $(sidebarSelector);
        const content = $(contentSelector);
        const header = $(headerSelector);

        sidebar.css({
          position: "fixed",
          left: "0px",
          top: "0px",
          width: "280px",
          height: "100vh",
          "z-index": "1000",
          transform: "translateX(0)",
          visibility: "visible",
          opacity: "1",
          display: "flex"
        });

        content.css({
          "margin-left": "280px",
          width: "calc(100% - 280px)"
        });

        header.css({
          left: "280px",
          width: "calc(100% - 280px)"
        });

        console.log("Candidate sidebar fix applied");
      }, 1000);
    }
  });
})(jQuery);
