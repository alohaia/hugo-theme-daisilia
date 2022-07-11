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
    d <- gsub("^source/_?|[.][a-zA-Z]+$", "", a[1])
    reld <- paste(strsplit(d, "/")[[1]][-1], collapse = "/") # remove "content/"
    reld <- gsub("/index$", "", reld)
    knitr::opts_chunk$set(
        fig.path   = sprintf("../static/R-figures/%s/", reld),
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
        error      = TRUE
    )
    options(digits = 4)
    knitr::knit(a[1], a[2],
        quiet = TRUE, encoding = "UTF-8", envir = .GlobalEnv
    )

    text <- readLines(a[2], encoding = "UTF-8")
    # post processing
    text <- gsub("!\\[(.*?)\\]\\(.*?([^/]*?\\.png)\\)",
        sprintf('{{< figure src="/R-figures/%s/\\2" title="\\1" alt="\\1" >}}', reld),
        text,
        perl = TRUE
    )
    writeLines(text, con = a[2], sep = "\n", useBytes = FALSE)
})
