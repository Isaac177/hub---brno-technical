--
-- PostgreSQL database dump
--

-- Dumped from database version 15.6 (Postgres.index)
-- Dumped by pg_dump version 15.6 (Postgres.index)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: EnrollmentStatus; Type: TYPE; Schema: public; Owner: ggg
--

CREATE TYPE public."EnrollmentStatus" AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'DROPPED',
    'ON_HOLD'
);


ALTER TYPE public."EnrollmentStatus" OWNER TO ggg;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: ggg
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO ggg;

--
-- Name: PayoutStatus; Type: TYPE; Schema: public; Owner: ggg
--

CREATE TYPE public."PayoutStatus" AS ENUM (
    'SCHEDULED',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public."PayoutStatus" OWNER TO ggg;

--
-- Name: RefundStatus; Type: TYPE; Schema: public; Owner: ggg
--

CREATE TYPE public."RefundStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'PROCESSED',
    'REJECTED'
);


ALTER TYPE public."RefundStatus" OWNER TO ggg;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Certificate; Type: TABLE; Schema: public; Owner: ggg
--

CREATE TABLE public."Certificate" (
    id text NOT NULL,
    "enrollmentId" text NOT NULL,
    "issuedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "pdfUrl" text NOT NULL,
    "verificationCode" text NOT NULL
);


ALTER TABLE public."Certificate" OWNER TO ggg;

--
-- Name: Enrollment; Type: TABLE; Schema: public; Owner: ggg
--

CREATE TABLE public."Enrollment" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "courseId" text NOT NULL,
    status public."EnrollmentStatus" NOT NULL,
    "enrolledAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastAccessedAt" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone,
    progress double precision DEFAULT 0 NOT NULL,
    "transactionId" text NOT NULL,
    amount numeric(65,30) NOT NULL,
    currency text NOT NULL,
    "paymentStatus" public."PaymentStatus" NOT NULL
);


ALTER TABLE public."Enrollment" OWNER TO ggg;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: ggg
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "enrollmentId" text NOT NULL,
    amount numeric(65,30) NOT NULL,
    currency text NOT NULL,
    status public."PaymentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "paymentMethod" text NOT NULL,
    "transactionReference" text NOT NULL,
    "lastFourDigits" text,
    "tokenizedDetails" text
);


ALTER TABLE public."Payment" OWNER TO ggg;

--
-- Name: Payout; Type: TABLE; Schema: public; Owner: ggg
--

CREATE TABLE public."Payout" (
    id text NOT NULL,
    "schoolId" text NOT NULL,
    amount numeric(65,30) NOT NULL,
    currency text NOT NULL,
    status public."PayoutStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processedAt" timestamp(3) without time zone,
    "bankAccountDetails" text NOT NULL,
    "payoutReference" text NOT NULL
);


ALTER TABLE public."Payout" OWNER TO ggg;

--
-- Name: Refund; Type: TABLE; Schema: public; Owner: ggg
--

CREATE TABLE public."Refund" (
    id text NOT NULL,
    "enrollmentId" text NOT NULL,
    amount numeric(65,30) NOT NULL,
    status public."RefundStatus" NOT NULL,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processedAt" timestamp(3) without time zone,
    reason text NOT NULL,
    "refundReference" text NOT NULL
);


ALTER TABLE public."Refund" OWNER TO ggg;

--
-- Name: RevenueShare; Type: TABLE; Schema: public; Owner: ggg
--

CREATE TABLE public."RevenueShare" (
    id text NOT NULL,
    "paymentId" text NOT NULL,
    "schoolId" text NOT NULL,
    "schoolShare" numeric(65,30) NOT NULL,
    "platformShare" numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RevenueShare" OWNER TO ggg;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: ggg
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO ggg;

--
-- Data for Name: Certificate; Type: TABLE DATA; Schema: public; Owner: ggg
--

COPY public."Certificate" (id, "enrollmentId", "issuedAt", "pdfUrl", "verificationCode") FROM stdin;
937369bc-25d7-4830-94a7-709b7cf27302	738507ba-657d-4f6d-8a97-66db2944d54a	2024-09-02 15:44:08.628	https://example.com/certificates/slyyk1x5wlw101taddc8.pdf	slyyk1x5wlw101taddc8
\.


--
-- Data for Name: Enrollment; Type: TABLE DATA; Schema: public; Owner: ggg
--

COPY public."Enrollment" (id, "userId", "courseId", status, "enrolledAt", "lastAccessedAt", "completedAt", progress, "transactionId", amount, currency, "paymentStatus") FROM stdin;
738507ba-657d-4f6d-8a97-66db2944d54a	user-123	course-001	COMPLETED	2024-09-02 15:08:57.848	2024-09-02 15:43:50.127	2024-09-02 15:43:50.125	100	mock-transaction-id	49.990000000000000000000000000000	USD	COMPLETED
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: ggg
--

COPY public."Payment" (id, "enrollmentId", amount, currency, status, "createdAt", "updatedAt", "paymentMethod", "transactionReference", "lastFourDigits", "tokenizedDetails") FROM stdin;
15438250-1506-46de-af32-44910490caae	738507ba-657d-4f6d-8a97-66db2944d54a	49.990000000000000000000000000000	USD	COMPLETED	2024-09-02 15:08:57.848	2024-09-02 15:08:57.848	credit_card	mock-transaction-id	1234	\N
\.


--
-- Data for Name: Payout; Type: TABLE DATA; Schema: public; Owner: ggg
--

COPY public."Payout" (id, "schoolId", amount, currency, status, "createdAt", "processedAt", "bankAccountDetails", "payoutReference") FROM stdin;
\.


--
-- Data for Name: Refund; Type: TABLE DATA; Schema: public; Owner: ggg
--

COPY public."Refund" (id, "enrollmentId", amount, status, "requestedAt", "processedAt", reason, "refundReference") FROM stdin;
\.


--
-- Data for Name: RevenueShare; Type: TABLE DATA; Schema: public; Owner: ggg
--

COPY public."RevenueShare" (id, "paymentId", "schoolId", "schoolShare", "platformShare", "createdAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: ggg
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
07205155-ee49-47ad-b055-dfe6aec22631	e1d730672e1d673b7beef50d6f99848aae4465ace252b79694e784e593fb48ad	2024-09-02 19:24:36.67247+05	20240902142436_first_migration	\N	\N	2024-09-02 19:24:36.655645+05	1
\.


--
-- Name: Certificate Certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: ggg
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_pkey" PRIMARY KEY (id);


--
-- Name: Enrollment Enrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: ggg
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: ggg
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: Payout Payout_pkey; Type: CONSTRAINT; Schema: public; Owner: ggg
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_pkey" PRIMARY KEY (id);


--
-- Name: Refund Refund_pkey; Type: CONSTRAINT; Schema: public; Owner: ggg
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_pkey" PRIMARY KEY (id);


--
-- Name: RevenueShare RevenueShare_pkey; Type: CONSTRAINT; Schema: public; Owner: ggg
--

ALTER TABLE ONLY public."RevenueShare"
    ADD CONSTRAINT "RevenueShare_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: ggg
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Certificate_enrollmentId_key; Type: INDEX; Schema: public; Owner: ggg
--

CREATE UNIQUE INDEX "Certificate_enrollmentId_key" ON public."Certificate" USING btree ("enrollmentId");


--
-- Name: Certificate_verificationCode_key; Type: INDEX; Schema: public; Owner: ggg
--

CREATE UNIQUE INDEX "Certificate_verificationCode_key" ON public."Certificate" USING btree ("verificationCode");


--
-- Name: Enrollment_transactionId_key; Type: INDEX; Schema: public; Owner: ggg
--

CREATE UNIQUE INDEX "Enrollment_transactionId_key" ON public."Enrollment" USING btree ("transactionId");


--
-- Name: Enrollment_userId_courseId_key; Type: INDEX; Schema: public; Owner: ggg
--

CREATE UNIQUE INDEX "Enrollment_userId_courseId_key" ON public."Enrollment" USING btree ("userId", "courseId");


--
-- Name: Payment_transactionReference_key; Type: INDEX; Schema: public; Owner: ggg
--

CREATE UNIQUE INDEX "Payment_transactionReference_key" ON public."Payment" USING btree ("transactionReference");


--
-- Name: Payout_payoutReference_key; Type: INDEX; Schema: public; Owner: ggg
--

CREATE UNIQUE INDEX "Payout_payoutReference_key" ON public."Payout" USING btree ("payoutReference");


--
-- Name: Refund_refundReference_key; Type: INDEX; Schema: public; Owner: ggg
--

CREATE UNIQUE INDEX "Refund_refundReference_key" ON public."Refund" USING btree ("refundReference");


--
-- Name: RevenueShare_paymentId_key; Type: INDEX; Schema: public; Owner: ggg
--

CREATE UNIQUE INDEX "RevenueShare_paymentId_key" ON public."RevenueShare" USING btree ("paymentId");


--
-- Name: Certificate Certificate_enrollmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ggg
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES public."Enrollment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_enrollmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ggg
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES public."Enrollment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Refund Refund_enrollmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ggg
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES public."Enrollment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RevenueShare RevenueShare_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ggg
--

ALTER TABLE ONLY public."RevenueShare"
    ADD CONSTRAINT "RevenueShare_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public."Payment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

