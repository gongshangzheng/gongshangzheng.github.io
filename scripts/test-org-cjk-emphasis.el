;;; test-org-cjk-emphasis.el --- Verify Org emphasis export -*- lexical-binding: t; -*-
(require 'org)
(require 'ox-latex)

(defun test-org-cjk-emphasis--assert (condition message)
  (unless condition (error "%s" message)))

(let* ((cases '((" *中文* ：" bold)
                (" /中文/ ，" italic)
                (" Latin *bold* text " bold)
                (" Latin /italic/ text " italic)))
       (seen-bold nil)
       (seen-italic nil))
  (dolist (case cases)
    (with-temp-buffer
      (insert (car case))
      (org-mode)
      (let* ((tree (org-element-parse-buffer))
             (kind (cadr case))
             (nodes (org-element-map tree kind (lambda (node) node))))
        (test-org-cjk-emphasis--assert nodes
                                       (format "Org failed to parse %s in %S" kind (car case)))
        (setq seen-bold (or seen-bold (eq kind 'bold)))
        (setq seen-italic (or seen-italic (eq kind 'italic)))
        (let ((latex (org-export-as 'latex nil nil t)))
          (test-org-cjk-emphasis--assert
           (string-match-p (if (eq kind 'bold) "\\\\textbf{" "\\\\emph{") latex)
           (format "LaTeX exporter failed for %s" kind))))))
  (test-org-cjk-emphasis--assert (and seen-bold seen-italic) "Missing bold/italic coverage"))
(message "Org CJK emphasis export tests passed")
