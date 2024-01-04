#! /usr/bin/env Rscript

local({
    # fall back on '/' if baseurl is not specified
    baseurl <- blogdown:::get_config("baseUrl")
    knitr::opts_knit$set(
        base.url = baseurl,
        base.dir = normalizePath("content"),
        width = 70
    )

    # input/output filenames are passed as two additional arguments to Rscript
    a <- commandArgs(TRUE)
    root_dir <- getwd()
    if (a[3] != "NA") {
        root_dir <- path.expand(a[3])
    }
    root_dir <- gsub("/$", "", root_dir)
    reld <- gsub("^content/|(/_?index)?\\.Rmd$", "", a[1])

    # clean up old figures
    unlink(sprintf("%s/static/R-figures/%s/", root_dir, reld), recursive = FALSE)

    cat(sprintf("%s/static/R-figures/%s/\n", root_dir, reld))
    knitr::opts_chunk$set(
        fig.path   = sprintf("%s/static/R-figures/%s/", root_dir, reld),
        cache.path = sprintf("%s/.cache/%s/", root_dir, reld),
        comment    = "#>",
        results    = "hold",
        tiry       = TRUE,
        fig.width  = 10,
        fig.height = 6,
        fig.show   = "hold",
        dpi        = 120,
        message    = FALSE,
        warning    = FALSE,
        error      = TRUE
    )
    options(digits = 4)
    knitr::knit(a[1], a[2],
        quiet = TRUE, encoding = "UTF-8", envir = .GlobalEnv
    )

    text <- readLines(a[2], encoding = "UTF-8")
    # post processing
    text <- gsub("!\\[plot of chunk (.*?)\\]\\(.*?([^/]*?\\.png)\\)",
        sprintf('{{< figure src="/R-figures/%s/\\2" group="\\1" alt="\\1" >}}', reld),
        text,
        perl = TRUE
    )
    writeLines(text, con = a[2], sep = "\n", useBytes = FALSE)
})
