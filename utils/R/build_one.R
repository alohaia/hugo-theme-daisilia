#! /usr/bin/env Rscript
# run this script in site root dir

local({
    # input/output filenames are passed as two additional arguments to Rscript
    a <- commandArgs(trailingOnly = TRUE)
    reld <- gsub("^content/|(/_?index)?\\.Rmd$", "", a[1])

    named_args <- a[grepl(pattern = "^--\\w+=\\S+", a)]
    a <- a[!(a %in% named_args)]

    parsed <- sapply(named_args, function(x) {
        strsplit(sub("^--", "", x), "=")
    })
    parsed <- setNames(
        lapply(parsed, function(x) x[2]),
        lapply(parsed, function(x) x[1])
    )

    prefix <- ""
    if ("prefix" %in% names(parsed)) {
        prefix <- parsed$prefix    } else {
        prefix <- rprojroot::find_root(
            rprojroot::has_dir(".git") | rprojroot::has_file_pattern("README.*")
        )
    }

    a[1] <- file.path(prefix, a[1])
    a[2] <- file.path(prefix, a[2])
    target_dir <- file.path(prefix, "static/R-figures/", reld, "")

    # clean up old figures
    unlink(target_dir, recursive = TRUE)

    print(c(a, target_dir))

    knitr::opts_chunk$set(
        fig.path   = target_dir,
        comment    = "#>",
        results    = "hold",
        tiry       = TRUE,
        fig.width  = 10,
        fig.height = 6,
        fig.show   = "hold",
        dpi        = 120,
        message    = FALSE,
        warning    = FALSE,
        error      = TRUE,
        unnamed.chunk.label = ""
    )
    options(digits = 4)
    knitr::knit(
        a[1], a[2], quiet = TRUE, encoding = "UTF-8", envir = .GlobalEnv
    )

    text <- readLines(a[2], encoding = "UTF-8")
    # post processing
    text <- gsub("!\\[(plot of chunk )?(.*?)\\]\\(.*?([^/]*?)\\)",
        sprintf('{{< figure src="/R-figures/%s/\\3" group="\\2" alt="\\2" >}}', reld),
        text,
        perl = TRUE
    )
    writeLines(text, con = a[2], sep = "\n", useBytes = FALSE)
})
