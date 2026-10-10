-- Pesan care kini dokumen Tiptap (JSON); pesan teks lama dibungkus menjadi satu paragraf.
ALTER TABLE "CoacheeCare" ALTER COLUMN "message" TYPE JSONB USING
  CASE WHEN btrim("message") = '' THEN '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb
  ELSE jsonb_build_object('type', 'doc', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "message")))))
  END;
