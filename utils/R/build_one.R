#! /usr/bin/env Rscript
# run this script in site root dir

local({
    # input/output filenames are passed as two additional arguments to Rscript
    a <- commandArgs(TRUE)
    reld <- gsub("^content/|(/_?index)?\\.Rmd$", "", a[1])

    # clean up old figures
    unlink(sprintf("../static/R-figures/%s/", reld), recursive = FALSE)

    knitr::opts_chunk$set(
        fig.path   = sprintf("../static/R-figures/%s/", reld),
        cache      = TRUE,
        cache.path = sprintf("../.cache/%s/", reld),
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
    knitr::knit(a[1], a[2],
        quiet = TRUE, encoding = "UTF-8", envir = .GlobalEnv
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
