/* ------------------------------------------------------------------
   Site content. Edit this file to update the site: save, refresh, commit.
   An empty list shows tidy "coming soon" placeholder cards.
------------------------------------------------------------------- */
window.SITE = {
  /* CV: set to "assets/your_cv.pdf" once the updated PDF is in assets/. */
  cv: "",

  news: [
    { date: "2026", tag: "PhD",
      text: "Started my PhD at DISI, University of Trento, on <b>BUC-6G: Beyond Ubiquitous Connectivity</b>, intelligent, AI-native 6G systems." },
    { date: "Feb 2026", tag: "M.Sc.",
      text: "Completed my M.Sc. in Computer Engineering at the University of Pisa. Thesis: SRv6-based NFV chaining and energy-aware optimization in OMNeT++/INET." },
    { date: "2025", tag: "Paper",
      text: "IEEE ICMI 2025 paper published: <i>AI-Optimized Federated Learning with Dynamic Scheduling for HPC</i>." }
  ],

  /* Example:
     { name: "ARISE-6G", period: "2026 – now", active: true,
       title: "One-line description",
       text: "Two or three sentences on what it does and what you found.",
       tags: ["O-RAN", "RIS"], link: "https://github.com/matcompute/..." } */
  projects: [],

  publications: [
    { year: 2025, venue: "IEEE ICMI 2025 · Mount Pleasant, MI, USA",
      title: "AI-Optimized Federated Learning with Dynamic Scheduling for High-Performance Computing",
      authors: "<b>M. A. Tiruye</b>, T. A. Muche, T. A. Tesfamichael",
      doi: "10.1109/ICMI65310.2025.11141301" },
    { year: 2024, venue: "IEEE EPEPS 2024 · Toronto, Canada",
      title: "A 155 MHz Low-Jitter PLL for Enhanced Signal Integrity in High-Speed Interconnects",
      authors: "<b>M. A. Tiruye</b>, O. B. Gerba, T. H. Teo",
      doi: "10.1109/EPEPS61853.2024.10754287" },
    { year: 2022, venue: "IEEE MCSoC 2022 · Penang, Malaysia",
      title: "Systolic Array Based Convolutional Neural Network Inference on FPGA",
      authors: "S. H. Chua, T. H. Teo, <b>M. A. Tiruye</b>, I.-C. Wey",
      doi: "10.1109/MCSoC57363.2022.00029" },
    { year: 2022, venue: "IEEE MCSoC 2022 · Penang, Malaysia",
      title: "High-Performance Asynchronous CNN Accelerator with Early Termination",
      authors: "T. R. Loo, T. H. Teo, <b>M. A. Tiruye</b>, I.-C. Wey",
      doi: "10.1109/MCSoC57363.2022.00031" }
  ],

  /* Example: { org: "ETSI ISG ZSM", title: "GS ZSM 009-2", url: "https://..." } */
  reading: []
};
