/**
 * jQuery Transmit plugin (http://code.google.com/p/jquery-transmit)
 *
 * Copyright (c) 2008-2009 Carl Sziebert, Paul Gregoire
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
package com.googlecode.example;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import static org.apache.commons.fileupload.servlet.ServletFileUpload.isMultipartContent;
import static org.apache.commons.lang.StringUtils.lastIndexOf;
import static org.apache.commons.lang.StringUtils.substringAfterLast;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import static javax.servlet.http.HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
import static javax.servlet.http.HttpServletResponse.SC_OK;
import java.io.File;
import static java.io.File.separator;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

public class FileUploadServlet extends HttpServlet {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadServlet.class);
    private static final String STORAGE_ROOT = "/storage/";
    private static final int UPLOAD_SIZE = 5242880; // 5 Megs

    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }

    @Override
    @SuppressWarnings({"unchecked"})
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response) throws ServletException, IOException {
        logger.debug("Processing request...");
        if (isMultipartContent(request)) {
            String storageRoot = request.getSession().getServletContext().getRealPath(STORAGE_ROOT);
            File dirPath = new File(storageRoot);
            if (!dirPath.exists()) {
                if (dirPath.mkdirs()) {
                    logger.debug("Storage directories created successfully.");
                }
            }
            PrintWriter writer = response.getWriter();
            DiskFileItemFactory factory = new DiskFileItemFactory();
            factory.setSizeThreshold(UPLOAD_SIZE);
            factory.setRepository(dirPath);
            ServletFileUpload upload = new ServletFileUpload(factory);
            upload.setSizeMax(UPLOAD_SIZE);
            try {
                List<FileItem> items = upload.parseRequest(request);
                for (FileItem item : items) {
                    if (!item.isFormField()) {
                        File file = new File(
                                new StringBuilder(storageRoot).append(parseFileName(item)).toString());
                        logger.debug("Writing file to: {}", file.getCanonicalPath());
                        item.write(file);
                    }
                }
                response.setStatus(SC_OK);
            } catch (Exception e) {
                logger.error(e.getMessage(), e);
                response.setStatus(SC_INTERNAL_SERVER_ERROR);
            }
            writer.flush();
        }
    }

    private String parseFileName(FileItem item) {
        logger.debug("Parsing name from item: {}", item.getName());
        if (lastIndexOf(item.getName(), separator) != -1) {
            return substringAfterLast(item.getName(), separator);
        }
        return item.getName();
    }
}