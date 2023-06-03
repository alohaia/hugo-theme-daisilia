#! /usr/bin/env Rscript

message("=> knit Rmarkdown files")

build_one <- function(io) {
    # if output is not older than input, skip the compilation
    message("* knitting ", io[1])
    if (!blogdown:::require_rebuild(io[2], io[1])
        && !("--force" %in% commandArgs())) {
        cat(sprintf("  %s up to date.\n", io[2]))
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
    build_one(files[i, ])
}
