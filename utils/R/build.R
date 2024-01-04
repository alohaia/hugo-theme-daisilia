#! /usr/bin/env Rscript

message("=> knit Rmarkdown files")

a <- commandArgs(TRUE)

build_one <- function(io) {
    # if output is not older than input, skip the compilation
    message("* knitting ", io[1])
    if (!blogdown:::require_rebuild(io[2], io[1])
        && !("--force" %in% commandArgs())) {
        message(sprintf("  %s up to date.", io[2]))
        return()
    }

    if (xfun::Rscript(shQuote(c("utils/R/build_one.R", io))) != 0) {
        unlink(io[2])
        stop("Failed to compile ", io[1], " to ", io[2])
    }
}

# Rmd files under the source directory
rmds <- list.files("content", "[.]Rmd$", recursive = TRUE, full.names = TRUE)
files <- cbind(rmds, blogdown:::with_ext(rmds, ".md"))

for (i in seq_len(nrow(files))) {
    build_one(c(files[i, ], a[1]))
}

# remove redundant dirs
all_directories <- list.dirs("./static/R-figures", full.names = TRUE)
directories_to_keep <- gsub("(/_?index)?\\.Rmd", "", gsub("^content/", "./static/R-figures/", files[, 1]))
directories_to_remove <- setdiff(all_directories, directories_to_keep)
for (dir_path in rev(directories_to_remove)) {
    if (length(list.dirs(dir_path, recursive = FALSE)) == 0) {
        cat("REMOVE:", dir_path, "\n")
        unlink(dir_path, recursive = TRUE)
    }
}
