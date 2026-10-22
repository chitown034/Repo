# public-repo-guard

Public repo guard: before any git commit or push in /home/user/Repo it scans uncommitted changes, unpushed commits and new files for PPFC Trainual data (PPFC_KB, PPFC_LENDERS, file text, Trainual links, AE comp records) and refuses the command if any is found, because the GitHub repo is public and that data belongs only in the private published VANESSA page.
