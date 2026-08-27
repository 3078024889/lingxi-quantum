-- V315: align the stored default with the product-specific dendritic engine.
-- Existing assessment rows remain immutable and keep their original version.
alter table if exists public.mini_dendrite_assessments
  alter column algorithm_version set default 'lingxifield-dendritic-v2';
